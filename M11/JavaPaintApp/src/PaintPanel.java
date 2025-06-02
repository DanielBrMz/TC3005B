/**
 * Professional drawing canvas with variable stroke width and temporal layering.
 * Handles both vector graphics (lines/shapes) and raster operations (eraser/fill).
 */
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Queue;
import java.util.LinkedList;

public class PaintPanel extends JPanel implements ComponentListener {
    // Drawing state
    private Color currentColor = Color.BLACK;
    private Color currentFillColor = Color.WHITE;
    private String currentTool = "Pencil";
    private int currentStrokeWidth = 2;
    
    // Drawing systems
    private DrawingSystem drawingSystem = new DrawingSystem();
    private BufferedImage persistentImage = null;
    private boolean isInRasterMode = false;
    
    // Mouse interaction state
    private Point startPoint, endPoint;
    private ArrayList<Point> currentLine = new ArrayList<>();
    private boolean isActivelyDrawing = false;

    public PaintPanel() {
        setBackground(Color.WHITE);
        setupMouseHandling();
        addComponentListener(this);
    }

    /**
     * Configures mouse event handling for all drawing operations.
     * Implements left-click only drawing with tool-specific behavior.
     */
    private void setupMouseHandling() {
        MouseAdapter handler = new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                if (!SwingUtilities.isLeftMouseButton(e)) return;
                startPoint = e.getPoint();

                switch (currentTool) {
                    case "Fill":
                        performFloodFill(e.getPoint());
                        break;
                    case "Eraser":
                        switchToRasterModePreservingContent();
                        eraseAtPoint(e.getPoint());
                        break;
                    case "Pencil":
                        currentLine.clear();
                        currentLine.add(startPoint);
                        isActivelyDrawing = true;
                        break;
                    // Rectangle and Oval store start point for drag operations
                }
            }

            @Override
            public void mouseDragged(MouseEvent e) {
                if (!SwingUtilities.isLeftMouseButton(e)) return;
                endPoint = e.getPoint();

                switch (currentTool) {
                    case "Eraser":
                        if (startPoint != null) {
                            eraseLineFromTo(startPoint, endPoint);
                            startPoint = endPoint; // Update for continuous erasing
                        }
                        break;
                    case "Pencil":
                        if (isActivelyDrawing) {
                            currentLine.add(endPoint);
                        }
                        break;
                }
                repaint();
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                if (!SwingUtilities.isLeftMouseButton(e)) return;
                endPoint = e.getPoint();

                switch (currentTool) {
                    case "Pencil":
                        // Convert temporary line to permanent drawing element
                        if (isActivelyDrawing && currentLine.size() > 1) {
                            LineElement lineElement = new LineElement(currentLine, currentColor, currentStrokeWidth);
                            drawingSystem.addElement(lineElement);
                        }
                        isActivelyDrawing = false;
                        currentLine.clear();
                        break;
                    case "Rectangle":
                    case "Oval":
                        // Create and store completed shape
                        if (startPoint != null && endPoint != null) {
                            Shape shape = createShape();
                            if (shape != null) {
                                boolean shouldFill = !currentFillColor.equals(Color.WHITE) || 
                                                   !currentFillColor.equals(currentColor);
                                ShapeElement shapeElement = new ShapeElement(
                                    shape, currentColor, currentFillColor, shouldFill, currentStrokeWidth);
                                drawingSystem.addElement(shapeElement);
                            }
                        }
                        break;
                }

                startPoint = null;
                endPoint = null;
                repaint();
            }
        };

        addMouseListener(handler);
        addMouseMotionListener(handler);
    }

    /**
     * Converts vector graphics to raster image when pixel operations are needed.
     * Preserves all existing content while enabling eraser and flood fill tools.
     */
    private void switchToRasterModePreservingContent() {
        if (!isInRasterMode) {
            ensureRasterImageExists();
            Graphics2D g2 = persistentImage.createGraphics();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            
            // Render white background
            g2.setColor(Color.WHITE);
            g2.fillRect(0, 0, persistentImage.getWidth(), persistentImage.getHeight());
            
            // Transfer all vector content to raster image
            drawingSystem.renderAll(g2, persistentImage.getWidth(), persistentImage.getHeight());
            g2.dispose();
            
            // Clear vector system since content is now preserved in raster image
            drawingSystem.clear();
            isInRasterMode = true;
        }
    }

    /**
     * Creates or resizes raster image while preserving existing content.
     * Handles window resize and initial raster mode setup.
     */
    private void ensureRasterImageExists() {
        int w = Math.max(getWidth(), 1);
        int h = Math.max(getHeight(), 1);
        
        if (persistentImage == null || persistentImage.getWidth() != w || persistentImage.getHeight() != h) {
            BufferedImage newImage = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2 = newImage.createGraphics();
            g2.setColor(Color.WHITE);
            g2.fillRect(0, 0, w, h);
            
            // Copy existing content if available
            if (persistentImage != null) {
                g2.drawImage(persistentImage, 0, 0, null);
            }
            g2.dispose();
            persistentImage = newImage;
        }
    }

    /**
     * Implements flood fill algorithm using queue-based approach.
     * Fills connected areas of the same color with current stroke color.
     */
    private void performFloodFill(Point point) {
        switchToRasterModePreservingContent();

        // Bounds checking
        if (point.x < 0 || point.x >= persistentImage.getWidth() || 
            point.y < 0 || point.y >= persistentImage.getHeight()) return;

        int targetColor = persistentImage.getRGB(point.x, point.y);
        int fillColor = currentColor.getRGB();
        if (targetColor == fillColor) return;

        // Queue-based flood fill for better performance than recursive approach
        Queue<Point> queue = new LinkedList<>();
        queue.add(point);

        while (!queue.isEmpty()) {
            Point p = queue.remove();
            if (p.x < 0 || p.x >= persistentImage.getWidth() || 
                p.y < 0 || p.y >= persistentImage.getHeight()) continue;
            if (persistentImage.getRGB(p.x, p.y) != targetColor) continue;

            persistentImage.setRGB(p.x, p.y, fillColor);
            
            // Add adjacent pixels (4-connected)
            queue.add(new Point(p.x + 1, p.y));
            queue.add(new Point(p.x - 1, p.y));
            queue.add(new Point(p.x, p.y + 1));
            queue.add(new Point(p.x, p.y - 1));
        }
        repaint();
    }

    /**
     * Erases content at point using circular brush scaled to stroke width.
     */
    private void eraseAtPoint(Point point) {
        if (persistentImage == null) return;
        Graphics2D g2 = persistentImage.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setColor(Color.WHITE);
        
        // Scale eraser size to stroke width with minimum usability threshold
        int eraserSize = Math.max(currentStrokeWidth * 2, 8);
        g2.fillOval(point.x - eraserSize/2, point.y - eraserSize/2, eraserSize, eraserSize);
        g2.dispose();
    }

    /**
     * Erases along drag path for smooth continuous erasing.
     */
    private void eraseLineFromTo(Point from, Point to) {
        if (persistentImage == null) return;
        Graphics2D g2 = persistentImage.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setColor(Color.WHITE);
        
        // Scale eraser stroke to current stroke width
        float eraserWidth = Math.max(currentStrokeWidth * 2.0f, 8.0f);
        g2.setStroke(new BasicStroke(eraserWidth, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g2.drawLine(from.x, from.y, to.x, to.y);
        g2.dispose();
    }

    /**
     * Creates geometric shape based on current tool and mouse positions.
     */
    private Shape createShape() {
        if (startPoint == null || endPoint == null) return null;
        
        int x = Math.min(startPoint.x, endPoint.x);
        int y = Math.min(startPoint.y, endPoint.y);
        int width = Math.abs(endPoint.x - startPoint.x);
        int height = Math.abs(endPoint.y - startPoint.y);

        return currentTool.equals("Rectangle") ? 
            new Rectangle(x, y, width, height) :
            new java.awt.geom.Ellipse2D.Double(x, y, width, height);
    }

    /**
     * Clears all content and resets canvas to initial state.
     */
    public void clearAll() {
        drawingSystem.clear();
        persistentImage = null;
        isInRasterMode = false;
        isActivelyDrawing = false;
        currentLine.clear();
        startPoint = null;
        endPoint = null;
        repaint();
    }

    /**
     * Draws Konami code easter egg emoji with sunglasses.
     */
    public void drawCoolEmoji() {
        switchToRasterModePreservingContent();
        Graphics2D g2 = persistentImage.createGraphics();
        
        int centerX = getWidth() / 2;
        int centerY = getHeight() / 2;
        int size = Math.min(getWidth(), getHeight()) / 3;

        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Yellow face with gradient
        java.awt.GradientPaint gradient = new java.awt.GradientPaint(
            centerX - size/2, centerY - size/2, new Color(255, 255, 0),
            centerX + size/2, centerY + size/2, new Color(255, 220, 0));
        g2.setPaint(gradient);
        g2.fillOval(centerX - size/2, centerY - size/2, size, size);

        // Face highlight
        g2.setColor(new Color(255, 255, 200, 90));
        g2.fillOval(centerX - size/3, centerY - size/3, size/3, size/4);

        // Face outline
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(2.5f));
        g2.drawOval(centerX - size/2, centerY - size/2, size, size);

        // Sunglasses lenses
        int gw = size / 4, gh = size / 6, gy = centerY - gh;
        g2.fillRoundRect(centerX - gw - 10, gy, gw, gh, 15, 12);
        g2.fillRoundRect(centerX + 10, gy, gw, gh, 15, 12);

        // Lens highlights
        g2.setColor(new Color(100, 180, 255, 80));
        g2.fillRoundRect(centerX - gw - 5, gy + 3, gw/2, gh/3, 10, 8);
        g2.fillRoundRect(centerX + 15, gy + 3, gw/2, gh/3, 10, 8);

        // Sunglasses bridge
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(3.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        java.awt.geom.QuadCurve2D bridge = new java.awt.geom.QuadCurve2D.Float(
            centerX - 10, gy + gh/2 - 3, centerX, gy + gh/2 - 8, centerX + 10, gy + gh/2 - 3);
        g2.draw(bridge);

        // Sunglasses arms
        g2.setStroke(new BasicStroke(3f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        java.awt.geom.QuadCurve2D leftArm = new java.awt.geom.QuadCurve2D.Float(
            centerX - gw - 10, gy + gh/2, centerX - gw - 20, gy + gh/2 + 5, centerX - gw - 30, gy + gh + 10);
        java.awt.geom.QuadCurve2D rightArm = new java.awt.geom.QuadCurve2D.Float(
            centerX + gw + 10, gy + gh/2, centerX + gw + 20, gy + gh/2 + 5, centerX + gw + 30, gy + gh + 10);
        g2.draw(leftArm);
        g2.draw(rightArm);

        // Smile
        int sw = size / 2, sh = size / 6, sy = centerY + size / 8;
        java.awt.geom.CubicCurve2D smile = new java.awt.geom.CubicCurve2D.Double(
            centerX - sw/2, sy + sh/2, centerX - sw/4, sy + sh,
            centerX + sw/4, sy + sh, centerX + sw/2, sy + sh/2);
        g2.draw(smile);

        g2.dispose();
        repaint();
    }
    

    /**
     * Main rendering method with stroke-aware preview and feedback.
     */
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Render persistent content (raster or vector)
        if (isInRasterMode && persistentImage != null) {
            g2d.drawImage(persistentImage, 0, 0, null);
        } else {
            drawingSystem.renderAll(g2d, getWidth(), getHeight());
        }

        // Real-time pencil feedback with current stroke width
        if (isActivelyDrawing && currentLine.size() > 1) {
            g2d.setColor(currentColor);
            g2d.setStroke(new BasicStroke(currentStrokeWidth, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            for (int i = 0; i < currentLine.size() - 1; i++) {
                Point p1 = currentLine.get(i);
                Point p2 = currentLine.get(i + 1);
                g2d.drawLine(p1.x, p1.y, p2.x, p2.y);
            }
        }

        // Shape preview with stroke width and fill preview
        if (startPoint != null && endPoint != null &&
            (currentTool.equals("Rectangle") || currentTool.equals("Oval"))) {
            
            Shape preview = createShape();
            if (preview != null) {
                // Semi-transparent fill preview
                boolean shouldShowFill = !currentFillColor.equals(Color.WHITE) || 
                                       !currentFillColor.equals(currentColor);
                if (shouldShowFill) {
                    g2d.setColor(new Color(currentFillColor.getRed(), 
                        currentFillColor.getGreen(), currentFillColor.getBlue(), 100));
                    g2d.fill(preview);
                }
                
                // Dashed outline preview with current stroke width
                g2d.setColor(currentColor);
                g2d.setStroke(new BasicStroke(currentStrokeWidth, BasicStroke.CAP_BUTT, 
                    BasicStroke.JOIN_MITER, 10.0f, new float[]{5.0f}, 0.0f));
                g2d.draw(preview);
            }
        }
    }

    // Configuration setters
    public void setCurrentColor(Color color) { 
        this.currentColor = color; 
    }
    
    public void setCurrentFillColor(Color color) { 
        this.currentFillColor = color; 
    }
    
    public void setCurrentTool(String tool) { 
        this.currentTool = tool; 
    }
    
    public void setStrokeWidth(int strokeWidth) { 
        this.currentStrokeWidth = Math.max(1, strokeWidth); 
    }

    /**
     * Handles window resize while preserving all drawing content.
     * Expands canvas size to accommodate both new dimensions and existing content.
     */
    @Override
    public void componentResized(ComponentEvent e) {
        if (isInRasterMode && persistentImage != null) {
            // Create expanded canvas that preserves all existing content
            int newW = Math.max(getWidth(), persistentImage.getWidth());
            int newH = Math.max(getHeight(), persistentImage.getHeight());
            
            BufferedImage newImage = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = newImage.createGraphics();
            g2d.setColor(Color.WHITE);
            g2d.fillRect(0, 0, newW, newH);
            g2d.drawImage(persistentImage, 0, 0, null);
            g2d.dispose();
            persistentImage = newImage;
        }
    }

    @Override public void componentMoved(ComponentEvent e) {}
    @Override public void componentShown(ComponentEvent e) {}
    @Override public void componentHidden(ComponentEvent e) {}
}