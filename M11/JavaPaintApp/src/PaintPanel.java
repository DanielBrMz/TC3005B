/*
 * Enhanced Java Paint Panel with Shape Filling and Mouse Button Differentiation
 * - Left-click only drawing and interaction
 * - Shape filling with separate fill colors
 * - Enhanced visual feedback
 */

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Queue;
import java.util.LinkedList;
import java.awt.GradientPaint;
import java.awt.geom.QuadCurve2D;
import java.awt.geom.CubicCurve2D;

public class PaintPanel extends JPanel implements ComponentListener {
    private Color currentColor = Color.BLACK;        // Stroke/outline color
    private Color currentFillColor = Color.WHITE;    // Fill color for shapes
    private String currentTool = "Pencil";
    private boolean hasBeenConverted = false; // Track if we've converted to image buffer

    // For storing the image
    private BufferedImage image;

    // For all shapes - now we need to track both outline and fill colors
    private Point startPoint;
    private Point endPoint;

    // For pencil and eraser lines
    private ArrayList<ArrayList<Point>> lines = new ArrayList<>();
    private ArrayList<Color> lineColors = new ArrayList<>();

    // For shapes - we now store both stroke and fill information
    private ArrayList<Shape> shapes = new ArrayList<>();
    private ArrayList<Color> shapeStrokeColors = new ArrayList<>();
    private ArrayList<Color> shapeFillColors = new ArrayList<>();
    private ArrayList<Boolean> shapeFilled = new ArrayList<>(); // Track if shape should be filled

    public PaintPanel() {
        setBackground(Color.WHITE);

        // Create a new list for the current drawing
        lines.add(new ArrayList<>());
        lineColors.add(currentColor);

        // Add mouse listeners with enhanced left/right click handling
        MouseAdapter mouseAdapter = new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                // Only respond to left mouse button for drawing operations
                if (!SwingUtilities.isLeftMouseButton(e)) {
                    return; // Ignore right clicks and middle clicks for drawing
                }
                
                startPoint = e.getPoint();

                if (currentTool.equals("Fill")) {
                    // Perform flood fill with the current stroke color
                    floodFill(e.getPoint());
                } else if (currentTool.equals("Eraser")) {
                    // For eraser, convert to image buffer only on first use
                    if (!hasBeenConverted) {
                        convertToImageBuffer();
                        hasBeenConverted = true;
                    }
                    eraseAtPoint(e.getPoint());
                } else if (currentTool.equals("Pencil")) {
                    // Create a new line for pencil
                    ArrayList<Point> newLine = new ArrayList<>();
                    newLine.add(startPoint);
                    lines.add(newLine);
                    lineColors.add(currentColor);
                }
                // For Rectangle and Oval, we just store the start point and wait for mouse release
            }

            @Override
            public void mouseDragged(MouseEvent e) {
                // Only respond to left mouse button drags
                if (!SwingUtilities.isLeftMouseButton(e)) {
                    return;
                }
                
                endPoint = e.getPoint();

                if (currentTool.equals("Eraser")) {
                    // Erase along the drag path with line drawing for smoother erasing
                    if (startPoint != null) {
                        eraseLineFromTo(startPoint, endPoint);
                        startPoint = endPoint; // Update start point for continuous erasing
                    }
                } else if (currentTool.equals("Pencil")) {
                    // Add point to the current line
                    if (!lines.isEmpty()) {
                        lines.get(lines.size() - 1).add(endPoint);
                    }
                }

                repaint(); // Show real-time preview for shapes
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                // Only respond to left mouse button releases
                if (!SwingUtilities.isLeftMouseButton(e)) {
                    return;
                }
                
                endPoint = e.getPoint();

                // Create shapes only for Rectangle and Oval tools
                if ((currentTool.equals("Rectangle") || currentTool.equals("Oval")) && 
                    startPoint != null && endPoint != null) {
                    
                    Shape newShape = createShape();
                    if (newShape != null) {
                        shapes.add(newShape);
                        shapeStrokeColors.add(currentColor);
                        shapeFillColors.add(currentFillColor);
                        
                        // Determine if we should fill the shape
                        // Fill if the fill color is different from white (default background)
                        // or if the fill color is explicitly set to white but different from stroke
                        boolean shouldFill = !currentFillColor.equals(Color.WHITE) || 
                                           !currentFillColor.equals(currentColor);
                        shapeFilled.add(shouldFill);
                    }
                }

                // Clear start and end points after completing the operation
                startPoint = null;
                endPoint = null;
                repaint();
            }
        };

        addMouseListener(mouseAdapter);
        addMouseMotionListener(mouseAdapter);

        // Add component listener for resize events
        addComponentListener(this);
    }

    /**
     * Converts all current vector graphics to the image buffer and clears vector arrays
     * This is called when we need to switch to raster operations (eraser, flood fill)
     */
    private void convertToImageBuffer() {
        // Create or update the image buffer to match current panel size
        if (image == null || image.getWidth() != getWidth() || image.getHeight() != getHeight()) {
            image = new BufferedImage(getWidth(), getHeight(), BufferedImage.TYPE_INT_ARGB);
        }
        
        // Draw all current content to the image buffer
        Graphics2D g2 = image.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        paintAllToGraphics(g2);
        g2.dispose();
        
        // Clear the vector graphics arrays since they're now stored in the image buffer
        lines.clear();
        lineColors.clear();
        shapes.clear();
        shapeStrokeColors.clear();
        shapeFillColors.clear();
        shapeFilled.clear();
        
        // Start fresh for new drawings
        lines.add(new ArrayList<>());
        lineColors.add(currentColor);
    }

    /**
     * Ensures that the image buffer exists and contains current content (for flood fill)
     */
    private void ensureImageExists() {
        if (image == null || image.getWidth() != getWidth() || image.getHeight() != getHeight()) {
            // Create an image the size of the panel
            image = new BufferedImage(getWidth(), getHeight(), BufferedImage.TYPE_INT_ARGB);
        }
        
        // Always update the image with current content before flood fill
        Graphics2D g2 = image.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        paintAllToGraphics(g2);
        g2.dispose();
    }

    /**
     * Erases content at the specified point with a brush-like effect
     */
    private void eraseAtPoint(Point point) {
        if (image == null) return;
        
        Graphics2D g2 = image.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Set up eraser brush - white color with a circular brush
        g2.setColor(Color.WHITE);
        
        // Erase by drawing a small circle at the point
        int brushSize = 12;
        g2.fillOval(point.x - brushSize/2, point.y - brushSize/2, brushSize, brushSize);
        
        g2.dispose();
    }

    /**
     * Erases content along a line from point A to point B for smooth erasing
     */
    private void eraseLineFromTo(Point from, Point to) {
        if (image == null) return;
        
        Graphics2D g2 = image.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Set up eraser brush
        g2.setColor(Color.WHITE);
        g2.setStroke(new BasicStroke(12.0f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        
        // Draw a white line to erase
        g2.drawLine(from.x, from.y, to.x, to.y);
        
        g2.dispose();
    }

    /**
     * Clears all drawn content from the canvas
     */
    public void clearAll() {
        // Clear all lines
        lines.clear();
        lineColors.clear();
        
        // Clear all shapes and their associated color information
        shapes.clear();
        shapeStrokeColors.clear();
        shapeFillColors.clear();
        shapeFilled.clear();
        
        // Clear the image buffer
        image = null;
        
        // Reset conversion flag
        hasBeenConverted = false;
        
        // Create a new empty line list
        lines.add(new ArrayList<>());
        lineColors.add(currentColor);
        
        // Repaint the panel
        repaint();
    }

    /**
     * Performs a flood fill starting at the specified point using the current stroke color
     */
    private void floodFill(Point point) {
        // First, we need to ensure we have an image to work with
        ensureImageExists();

        // Safety check for point being within bounds
        if (point.x < 0 || point.x >= image.getWidth() || point.y < 0 || point.y >= image.getHeight()) {
            return;
        }

        // Get the color at the target point
        int targetColor = image.getRGB(point.x, point.y);

        // Don't fill if we're clicking on the same color we want to fill with
        if (targetColor == currentColor.getRGB()) {
            return;
        }

        // Use a queue-based flood fill algorithm for better performance
        Queue<Point> queue = new LinkedList<>();
        queue.add(point);

        while (!queue.isEmpty()) {
            Point p = queue.remove();

            // Check if this point is within bounds and has the target color
            if (p.x < 0 || p.x >= image.getWidth() || p.y < 0 || p.y >= image.getHeight()) {
                continue;
            }

            if (image.getRGB(p.x, p.y) != targetColor) {
                continue;
            }

            // Fill this pixel with the current stroke color
            image.setRGB(p.x, p.y, currentColor.getRGB());

            // Add adjacent pixels to the queue (4-connected flood fill)
            queue.add(new Point(p.x + 1, p.y));
            queue.add(new Point(p.x - 1, p.y));
            queue.add(new Point(p.x, p.y + 1));
            queue.add(new Point(p.x, p.y - 1));
        }

        repaint();
    }

    /**
     * Paints all content to the given graphics context
     * This method handles both filled and outlined shapes
     */
    private void paintAllToGraphics(Graphics2D g2d) {
        // Clear with white background
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, getWidth(), getHeight());

        // Draw all completed pencil lines first (so they appear behind shapes)
        for (int i = 0; i < lines.size(); i++) {
            ArrayList<Point> line = lines.get(i);
            if (line.size() > 1) {
                g2d.setColor(lineColors.get(i));
                g2d.setStroke(new BasicStroke(2.0f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                for (int j = 0; j < line.size() - 1; j++) {
                    Point p1 = line.get(j);
                    Point p2 = line.get(j + 1);
                    g2d.drawLine(p1.x, p1.y, p2.x, p2.y);
                }
            }
        }

        // Draw all shapes with proper filling and outlining
        for (int i = 0; i < shapes.size(); i++) {
            Shape shape = shapes.get(i);
            Color strokeColor = shapeStrokeColors.get(i);
            Color fillColor = shapeFillColors.get(i);
            boolean isFilled = shapeFilled.get(i);
            
            // First, fill the shape if it should be filled
            if (isFilled) {
                g2d.setColor(fillColor);
                g2d.fill(shape);
            }
            
            // Then draw the outline
            g2d.setColor(strokeColor);
            g2d.setStroke(new BasicStroke(2.0f));
            g2d.draw(shape);
        }
    }

    /**
     * Draws a cool emoji (😎) face on the canvas with enhanced details
     * This is triggered by the Konami code easter egg
     */
    public void drawCoolEmoji() {
        // First, ensure we have an image to draw on
        if (image == null) {
            image = new BufferedImage(getWidth(), getHeight(), BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2 = image.createGraphics();
            g2.setColor(Color.WHITE);
            g2.fillRect(0, 0, getWidth(), getHeight());
            paintAllToGraphics(g2);
            g2.dispose();
        }

        // Get graphics context for drawing the emoji
        Graphics2D g2 = image.createGraphics();

        // Calculate center and size based on panel dimensions
        int centerX = getWidth() / 2;
        int centerY = getHeight() / 2;
        int faceSize = Math.min(getWidth(), getHeight()) / 3;

        // Set rendering hints for smoother drawing
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

        // Draw yellow face with gradient for 3D effect
        GradientPaint yellowGradient = new GradientPaint(
                centerX - faceSize / 2, centerY - faceSize / 2,
                new Color(255, 255, 0), // Bright yellow
                centerX + faceSize / 2, centerY + faceSize / 2,
                new Color(255, 220, 0) // Slightly darker yellow for dimension
        );
        g2.setPaint(yellowGradient);
        g2.fillOval(centerX - faceSize / 2, centerY - faceSize / 2, faceSize, faceSize);

        // Draw subtle highlight for 3D effect
        g2.setColor(new Color(255, 255, 200, 90));
        g2.fillOval(centerX - faceSize / 3, centerY - faceSize / 3, faceSize / 3, faceSize / 4);

        // Draw black outline for the face
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(2.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g2.drawOval(centerX - faceSize / 2, centerY - faceSize / 2, faceSize, faceSize);

        // Draw improved sunglasses
        int glassWidth = faceSize / 4;
        int glassHeight = faceSize / 6;
        int glassY = centerY - glassHeight;

        // Sunglasses frame - left and right lenses
        g2.setColor(Color.BLACK);
        g2.fillRoundRect(centerX - glassWidth - 10, glassY, glassWidth, glassHeight, 15, 12);
        g2.fillRoundRect(centerX + 10, glassY, glassWidth, glassHeight, 15, 12);

        // Add blue-ish reflective highlight in lenses for realism
        g2.setColor(new Color(100, 180, 255, 80));
        g2.fillRoundRect(centerX - glassWidth - 5, glassY + 3, glassWidth / 2, glassHeight / 3, 10, 8);
        g2.fillRoundRect(centerX + 15, glassY + 3, glassWidth / 2, glassHeight / 3, 10, 8);

        // Bridge connecting the lenses with a curved design
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(3.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        QuadCurve2D bridge = new QuadCurve2D.Float(
                centerX - 10, glassY + glassHeight / 2 - 3,
                centerX, glassY + glassHeight / 2 - 8,
                centerX + 10, glassY + glassHeight / 2 - 3);
        g2.draw(bridge);

        // Temple arms (the parts that go over the ears) with realistic curves
        g2.setStroke(new BasicStroke(3f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        
        // Left temple arm - curved outward
        QuadCurve2D leftTemple = new QuadCurve2D.Float(
                centerX - glassWidth - 10, glassY + glassHeight / 2,
                centerX - glassWidth - 20, glassY + glassHeight / 2 + 5,
                centerX - glassWidth - 30, glassY + glassHeight + 10);
        g2.draw(leftTemple);

        // Right temple arm - curved outward
        QuadCurve2D rightTemple = new QuadCurve2D.Float(
                centerX + glassWidth + 10, glassY + glassHeight / 2,
                centerX + glassWidth + 20, glassY + glassHeight / 2 + 5,
                centerX + glassWidth + 30, glassY + glassHeight + 10);
        g2.draw(rightTemple);

        // Draw a natural, curved smile
        int smileWidth = faceSize / 2;
        int smileHeight = faceSize / 6;
        int smileY = centerY + faceSize / 8;

        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(3.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));

        // Create a smoother smile using a cubic curve
        CubicCurve2D smile = new CubicCurve2D.Double(
                centerX - smileWidth / 2, smileY + smileHeight / 2,
                centerX - smileWidth / 4, smileY + smileHeight,
                centerX + smileWidth / 4, smileY + smileHeight,
                centerX + smileWidth / 2, smileY + smileHeight / 2);
        g2.draw(smile);

        g2.dispose();
        repaint();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;
        
        // Enable antialiasing for smoother drawing
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // If we have an image from eraser, flood fill, or emoji operations, draw it first
        if (image != null) {
            g2d.drawImage(image, 0, 0, null);
        } else {
            // If no image exists, draw everything normally using vector graphics
            paintAllToGraphics(g2d);
        }

        // ALWAYS draw current pencil lines on top for real-time drawing feedback
        // (This ensures smooth drawing even when image buffer exists)
        for (int i = 0; i < lines.size(); i++) {
            ArrayList<Point> line = lines.get(i);
            if (line.size() > 1) {
                g2d.setColor(lineColors.get(i));
                g2d.setStroke(new BasicStroke(2.0f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                for (int j = 0; j < line.size() - 1; j++) {
                    Point p1 = line.get(j);
                    Point p2 = line.get(j + 1);
                    g2d.drawLine(p1.x, p1.y, p2.x, p2.y);
                }
            }
        }

        // ALWAYS draw current shapes on top for real-time drawing feedback
        for (int i = 0; i < shapes.size(); i++) {
            Shape shape = shapes.get(i);
            Color strokeColor = shapeStrokeColors.get(i);
            Color fillColor = shapeFillColors.get(i);
            boolean isFilled = shapeFilled.get(i);
            
            // Fill the shape first if it should be filled
            if (isFilled) {
                g2d.setColor(fillColor);
                g2d.fill(shape);
            }
            
            // Then draw the outline
            g2d.setColor(strokeColor);
            g2d.setStroke(new BasicStroke(2.0f));
            g2d.draw(shape);
        }

        // Draw current shape preview while dragging (only for Rectangle and Oval tools)
        if (startPoint != null && endPoint != null &&
                (currentTool.equals("Rectangle") || currentTool.equals("Oval"))) {
            
            Shape previewShape = createShape();
            if (previewShape != null) {
                // Show preview with semi-transparent fill if fill color is set
                boolean shouldShowFill = !currentFillColor.equals(Color.WHITE) || 
                                       !currentFillColor.equals(currentColor);
                
                if (shouldShowFill) {
                    // Draw semi-transparent fill for preview
                    Color transparentFill = new Color(
                        currentFillColor.getRed(),
                        currentFillColor.getGreen(),
                        currentFillColor.getBlue(),
                        100 // Semi-transparent
                    );
                    g2d.setColor(transparentFill);
                    g2d.fill(previewShape);
                }
                
                // Draw the outline
                g2d.setColor(currentColor);
                g2d.setStroke(new BasicStroke(2.0f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 
                              10.0f, new float[]{5.0f}, 0.0f)); // Dashed line for preview
                g2d.draw(previewShape);
            }
        }
    }

    /**
     * Creates a shape based on the current tool and start/end points
     */
    private Shape createShape() {
        if (startPoint == null || endPoint == null) {
            return null;
        }
        
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

    // Setter methods for color and tool management
    public void setCurrentColor(Color color) {
        this.currentColor = color;
    }
    
    public void setCurrentFillColor(Color color) {
        this.currentFillColor = color;
    }

    public void setCurrentTool(String tool) {
        this.currentTool = tool;
    }

    // ComponentListener methods for handling window resize
    @Override
    public void componentResized(ComponentEvent e) {
        // Create a new image with the new size and preserve existing content
        BufferedImage newImage = new BufferedImage(getWidth(), getHeight(), BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = newImage.createGraphics();

        // Fill with white background
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, getWidth(), getHeight());

        // Draw the old image if it exists
        if (image != null) {
            g2d.drawImage(image, 0, 0, null);
        }

        g2d.dispose();
        image = newImage;
    }

    @Override
    public void componentMoved(ComponentEvent e) {
        // No action needed
    }

    @Override
    public void componentShown(ComponentEvent e) {
        // No action needed
    }

    @Override
    public void componentHidden(ComponentEvent e) {
        // No action needed
    }
}