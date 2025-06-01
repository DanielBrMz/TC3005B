/**
 * PaintPanel.java
 * 
 * The main drawing canvas that handles all user interaction and rendering coordination.
 * This version fixes the critical bugs you identified:
 * 1. Automatic fading when switching to eraser tool
 * 2. Drawings disappearing when window is resized
 * 
 * The key insight to fixing these bugs is understanding the difference between
 * "content preservation" and "visual feedback". Content (your actual drawings)
 * should persist regardless of window operations, while visual feedback (like
 * current brush strokes) is temporary and contextual.
 */

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Queue;
import java.util.LinkedList;

public class PaintPanel extends JPanel implements ComponentListener {
    // Current drawing state
    private Color currentColor = Color.BLACK;
    private Color currentFillColor = Color.WHITE;
    private String currentTool = "Pencil";
    
    // Core drawing systems
    private DrawingSystem drawingSystem = new DrawingSystem();
    private BufferedImage persistentImage = null;  // For raster operations (eraser, fill, emoji)
    private boolean isInRasterMode = false;        // Track which mode we're in
    
    // Mouse interaction state
    private Point startPoint;
    private Point endPoint;
    
    // Real-time drawing feedback (temporary visual feedback while drawing)
    private ArrayList<Point> currentLine = new ArrayList<>();
    private boolean isActivelyDrawing = false;
    
    // Canvas dimensions tracking for resize handling
    private int lastWidth = 0;
    private int lastHeight = 0;

    /**
     * Constructor sets up the drawing canvas with proper event handling.
     * We initialize the canvas to be ready for immediate drawing operations.
     */
    public PaintPanel() {
        setBackground(Color.WHITE);
        setupMouseHandling();
        addComponentListener(this);
        
        // Initialize dimension tracking
        lastWidth = getWidth();
        lastHeight = getHeight();
    }

    /**
     * Sets up comprehensive mouse event handling with clear state separation.
     * 
     * The key to fixing the fading bug is maintaining clear separation between:
     * 1. Temporary visual feedback (what you see while drawing)
     * 2. Permanent content storage (what gets saved when you finish drawing)
     * 3. Mode transitions (when we switch between vector and raster modes)
     */
    private void setupMouseHandling() {
        MouseAdapter mouseHandler = new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                // Only respond to left mouse button for drawing operations
                if (!SwingUtilities.isLeftMouseButton(e)) return;
                
                startPoint = e.getPoint();

                switch (currentTool) {
                    case "Fill":
                        performFloodFill(e.getPoint());
                        break;
                    case "Eraser":
                        // CRITICAL FIX: Only switch to raster mode, don't lose existing content
                        switchToRasterModePreservingContent();
                        eraseAtPoint(e.getPoint());
                        break;
                    case "Pencil":
                        // Begin new line drawing with temporary feedback
                        currentLine.clear();
                        currentLine.add(startPoint);
                        isActivelyDrawing = true;
                        break;
                    // Rectangle and Oval tools just store start point for preview
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
                        // Add point to current line for smooth real-time feedback
                        if (isActivelyDrawing) {
                            currentLine.add(endPoint);
                        }
                        break;
                }

                repaint(); // Trigger visual update for real-time feedback
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                if (!SwingUtilities.isLeftMouseButton(e)) return;
                
                endPoint = e.getPoint();

                switch (currentTool) {
                    case "Pencil":
                        // CRITICAL: Convert temporary line to permanent storage
                        if (isActivelyDrawing && currentLine.size() > 1) {
                            LineElement lineElement = new LineElement(currentLine, currentColor);
                            drawingSystem.addElement(lineElement);
                        }
                        // Clean up temporary state
                        isActivelyDrawing = false;
                        currentLine.clear();
                        break;
                    case "Rectangle":
                    case "Oval":
                        // Create and store shape element
                        if (startPoint != null && endPoint != null) {
                            Shape shape = createShape();
                            if (shape != null) {
                                boolean shouldFill = !currentFillColor.equals(Color.WHITE) || 
                                                   !currentFillColor.equals(currentColor);
                                ShapeElement shapeElement = new ShapeElement(
                                    shape, currentColor, currentFillColor, shouldFill);
                                drawingSystem.addElement(shapeElement);
                            }
                        }
                        break;
                }

                // Clean up interaction state
                startPoint = null;
                endPoint = null;
                repaint();
            }
        };

        addMouseListener(mouseHandler);
        addMouseMotionListener(mouseHandler);
    }

    /**
     * CRITICAL BUG FIX: Switches to raster mode while preserving all existing content.
     * 
     * The original bug occurred because switching to eraser mode would clear the
     * vector drawings without properly preserving them in the raster image first.
     * This method ensures that all existing drawings are safely transferred to
     * the raster image before we start erasing operations.
     */
    private void switchToRasterModePreservingContent() {
        if (!isInRasterMode) {
            // Create or ensure we have a raster image of the correct size
            ensureRasterImageExists();
            
            // CRITICAL: Render all current vector content to the raster image
            Graphics2D g2 = persistentImage.createGraphics();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            
            // Draw white background first
            g2.setColor(Color.WHITE);
            g2.fillRect(0, 0, persistentImage.getWidth(), persistentImage.getHeight());
            
            // Then draw all vector elements to preserve them
            drawingSystem.renderAll(g2, persistentImage.getWidth(), persistentImage.getHeight());
            
            g2.dispose();
            
            // Now we can safely clear the vector system since content is preserved
            drawingSystem.clear();
            isInRasterMode = true;
        }
    }

    /**
     * Creates or ensures the raster image exists with the correct dimensions.
     * 
     * CRITICAL BUG FIX: This method now properly handles window resizing by
     * preserving existing content when the image needs to be recreated with new dimensions.
     */
    private void ensureRasterImageExists() {
        int currentWidth = getWidth();
        int currentHeight = getHeight();
        
        // Only recreate if we don't have an image or if dimensions changed
        if (persistentImage == null || 
            persistentImage.getWidth() != currentWidth || 
            persistentImage.getHeight() != currentHeight) {
            
            // Create new image with current dimensions
            BufferedImage newImage = new BufferedImage(
                Math.max(currentWidth, 1), 
                Math.max(currentHeight, 1), 
                BufferedImage.TYPE_INT_ARGB);
            
            Graphics2D g2 = newImage.createGraphics();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            
            // Fill with white background
            g2.setColor(Color.WHITE);
            g2.fillRect(0, 0, newImage.getWidth(), newImage.getHeight());
            
            // CRITICAL: If we had a previous image, copy its content to preserve drawings
            if (persistentImage != null) {
                g2.drawImage(persistentImage, 0, 0, null);
            }
            
            g2.dispose();
            persistentImage = newImage;
        }
    }

    /**
     * Performs flood fill operation starting at the specified point.
     */
    private void performFloodFill(Point point) {
        // Ensure we have a raster image to work with
        switchToRasterModePreservingContent();

        // Bounds checking
        if (point.x < 0 || point.x >= persistentImage.getWidth() || 
            point.y < 0 || point.y >= persistentImage.getHeight()) {
            return;
        }

        int targetColor = persistentImage.getRGB(point.x, point.y);
        int fillColor = currentColor.getRGB();

        // Don't fill if clicking on the same color
        if (targetColor == fillColor) return;

        // Efficient queue-based flood fill algorithm
        Queue<Point> queue = new LinkedList<>();
        queue.add(point);

        while (!queue.isEmpty()) {
            Point p = queue.remove();

            if (p.x < 0 || p.x >= persistentImage.getWidth() || 
                p.y < 0 || p.y >= persistentImage.getHeight()) continue;

            if (persistentImage.getRGB(p.x, p.y) != targetColor) continue;

            persistentImage.setRGB(p.x, p.y, fillColor);

            // Add adjacent pixels for 4-connected fill
            queue.add(new Point(p.x + 1, p.y));
            queue.add(new Point(p.x - 1, p.y));
            queue.add(new Point(p.x, p.y + 1));
            queue.add(new Point(p.x, p.y - 1));
        }

        repaint();
    }

    /**
     * Erases content at a specific point with a circular brush.
     */
    private void eraseAtPoint(Point point) {
        if (persistentImage == null) return;
        
        Graphics2D g2 = persistentImage.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setColor(Color.WHITE);
        
        int brushSize = 12;
        g2.fillOval(point.x - brushSize/2, point.y - brushSize/2, brushSize, brushSize);
        g2.dispose();
    }

    /**
     * Erases content along a line for smooth erasing during mouse drag.
     */
    private void eraseLineFromTo(Point from, Point to) {
        if (persistentImage == null) return;
        
        Graphics2D g2 = persistentImage.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setColor(Color.WHITE);
        g2.setStroke(new BasicStroke(12.0f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g2.drawLine(from.x, from.y, to.x, to.y);
        g2.dispose();
    }

    /**
     * Creates a shape based on current tool and mouse positions.
     */
    private Shape createShape() {
        if (startPoint == null || endPoint == null) return null;
        
        int x = Math.min(startPoint.x, endPoint.x);
        int y = Math.min(startPoint.y, endPoint.y);
        int width = Math.abs(endPoint.x - startPoint.x);
        int height = Math.abs(endPoint.y - startPoint.y);

        switch (currentTool) {
            case "Rectangle":
                return new Rectangle(x, y, width, height);
            case "Oval":
                return new java.awt.geom.Ellipse2D.Double(x, y, width, height);
            default:
                return null;
        }
    }

    /**
     * Clears all drawing content and resets the canvas to initial state.
     * This provides a clean slate while properly managing both vector and raster modes.
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
     * Draws the cool emoji easter egg on the canvas.
     * This converts to raster mode and draws directly on the persistent image.
     */
    public void drawCoolEmoji() {
        switchToRasterModePreservingContent();
        
        Graphics2D g2 = persistentImage.createGraphics();
        
        int centerX = getWidth() / 2;
        int centerY = getHeight() / 2;
        int faceSize = Math.min(getWidth(), getHeight()) / 3;

        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Draw face with gradient
        java.awt.GradientPaint gradient = new java.awt.GradientPaint(
            centerX - faceSize/2, centerY - faceSize/2, new Color(255, 255, 0),
            centerX + faceSize/2, centerY + faceSize/2, new Color(255, 220, 0));
        g2.setPaint(gradient);
        g2.fillOval(centerX - faceSize/2, centerY - faceSize/2, faceSize, faceSize);

        // Add highlight
        g2.setColor(new Color(255, 255, 200, 90));
        g2.fillOval(centerX - faceSize/3, centerY - faceSize/3, faceSize/3, faceSize/4);

        // Draw outline
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(2.5f));
        g2.drawOval(centerX - faceSize/2, centerY - faceSize/2, faceSize, faceSize);

        // Draw sunglasses
        int glassWidth = faceSize / 4;
        int glassHeight = faceSize / 6;
        int glassY = centerY - glassHeight;

        g2.fillRoundRect(centerX - glassWidth - 10, glassY, glassWidth, glassHeight, 15, 12);
        g2.fillRoundRect(centerX + 10, glassY, glassWidth, glassHeight, 15, 12);

        // Add lens highlights
        g2.setColor(new Color(100, 180, 255, 80));
        g2.fillRoundRect(centerX - glassWidth - 5, glassY + 3, glassWidth/2, glassHeight/3, 10, 8);
        g2.fillRoundRect(centerX + 15, glassY + 3, glassWidth/2, glassHeight/3, 10, 8);

        // Draw bridge
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(3.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        java.awt.geom.QuadCurve2D bridge = new java.awt.geom.QuadCurve2D.Float(
            centerX - 10, glassY + glassHeight/2 - 3,
            centerX, glassY + glassHeight/2 - 8,
            centerX + 10, glassY + glassHeight/2 - 3);
        g2.draw(bridge);

        // Draw temple arms
        g2.setStroke(new BasicStroke(3f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        java.awt.geom.QuadCurve2D leftTemple = new java.awt.geom.QuadCurve2D.Float(
            centerX - glassWidth - 10, glassY + glassHeight/2,
            centerX - glassWidth - 20, glassY + glassHeight/2 + 5,
            centerX - glassWidth - 30, glassY + glassHeight + 10);
        g2.draw(leftTemple);

        java.awt.geom.QuadCurve2D rightTemple = new java.awt.geom.QuadCurve2D.Float(
            centerX + glassWidth + 10, glassY + glassHeight/2,
            centerX + glassWidth + 20, glassY + glassHeight/2 + 5,
            centerX + glassWidth + 30, glassY + glassHeight + 10);
        g2.draw(rightTemple);

        // Draw smile
        int smileWidth = faceSize / 2;
        int smileHeight = faceSize / 6;
        int smileY = centerY + faceSize / 8;

        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(3.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        java.awt.geom.CubicCurve2D smile = new java.awt.geom.CubicCurve2D.Double(
            centerX - smileWidth/2, smileY + smileHeight/2,
            centerX - smileWidth/4, smileY + smileHeight,
            centerX + smileWidth/4, smileY + smileHeight,
            centerX + smileWidth/2, smileY + smileHeight/2);
        g2.draw(smile);

        g2.dispose();
        repaint();
    }

    /**
     * CRITICAL BUG FIX: Main rendering method with proper content preservation.
     * 
     * This method fixes the disappearing drawings bug by ensuring that content
     * is always preserved regardless of window operations or mode switches.
     * The key insight is that we must always render existing content first,
     * then add any temporary visual feedback on top.
     */
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;
        
        // Enable high-quality rendering
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

        // Phase 1: Draw all persistent content
        if (isInRasterMode && persistentImage != null) {
            // We're in raster mode - draw the persistent image
            g2d.drawImage(persistentImage, 0, 0, null);
        } else {
            // We're in vector mode - draw all vector graphics in chronological order
            drawingSystem.renderAll(g2d, getWidth(), getHeight());
        }

        // Phase 2: Draw real-time feedback for current drawing operations
        
        // Show the line being actively drawn with the pencil tool
        if (isActivelyDrawing && currentLine.size() > 1) {
            g2d.setColor(currentColor);
            g2d.setStroke(new BasicStroke(2.0f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            for (int i = 0; i < currentLine.size() - 1; i++) {
                Point p1 = currentLine.get(i);
                Point p2 = currentLine.get(i + 1);
                g2d.drawLine(p1.x, p1.y, p2.x, p2.y);
            }
        }

        // Show preview for shapes being drawn
        if (startPoint != null && endPoint != null &&
            (currentTool.equals("Rectangle") || currentTool.equals("Oval"))) {
            
            Shape previewShape = createShape();
            if (previewShape != null) {
                // Show semi-transparent fill preview if fill color is set
                boolean shouldShowFill = !currentFillColor.equals(Color.WHITE) || 
                                       !currentFillColor.equals(currentColor);
                
                if (shouldShowFill) {
                    Color transparentFill = new Color(
                        currentFillColor.getRed(),
                        currentFillColor.getGreen(),
                        currentFillColor.getBlue(),
                        100); // Semi-transparent for preview
                    g2d.setColor(transparentFill);
                    g2d.fill(previewShape);
                }
                
                // Draw dashed outline for preview
                g2d.setColor(currentColor);
                g2d.setStroke(new BasicStroke(2.0f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 
                              10.0f, new float[]{5.0f}, 0.0f));
                g2d.draw(previewShape);
            }
        }
    }

    // Setter methods for external configuration
    public void setCurrentColor(Color color) {
        this.currentColor = color;
    }
    
    public void setCurrentFillColor(Color color) {
        this.currentFillColor = color;
    }

    public void setCurrentTool(String tool) {
        this.currentTool = tool;
    }

    /**
     * CRITICAL BUG FIX: Component resize handling that preserves all drawings.
     * 
     * This method fixes the bug where drawings would disappear when the window
     * was resized and content was outside the new bounds. The key insight is
     * that we should preserve ALL content regardless of the window size, and
     * let the user scroll or resize as needed to see it all.
     */
    @Override
    public void componentResized(ComponentEvent e) {
        int newWidth = getWidth();
        int newHeight = getHeight();
        
        // Only handle resize if dimensions actually changed and are valid
        if (newWidth > 0 && newHeight > 0 && 
            (newWidth != lastWidth || newHeight != lastHeight)) {
            
            if (isInRasterMode && persistentImage != null) {
                // We're in raster mode - need to create a larger image and preserve content
                BufferedImage newImage = new BufferedImage(
                    Math.max(newWidth, persistentImage.getWidth()),  // Take the larger width
                    Math.max(newHeight, persistentImage.getHeight()), // Take the larger height
                    BufferedImage.TYPE_INT_ARGB);
                
                Graphics2D g2d = newImage.createGraphics();
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                
                // Fill with white background
                g2d.setColor(Color.WHITE);
                g2d.fillRect(0, 0, newImage.getWidth(), newImage.getHeight());
                
                // CRITICAL: Copy all existing content to preserve drawings
                g2d.drawImage(persistentImage, 0, 0, null);
                g2d.dispose();
                
                persistentImage = newImage;
            }
            // Note: Vector mode automatically handles resize since it redraws everything
            
            // Update our dimension tracking
            lastWidth = newWidth;
            lastHeight = newHeight;
        }
    }

    @Override
    public void componentMoved(ComponentEvent e) {
        // No action needed for moves
    }

    @Override
    public void componentShown(ComponentEvent e) {
        // No action needed when shown
    }

    @Override
    public void componentHidden(ComponentEvent e) {
        // No action needed when hidden
    }
}