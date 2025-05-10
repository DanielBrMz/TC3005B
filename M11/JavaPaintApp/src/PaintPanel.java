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
    private Color currentColor = Color.BLACK;
    private String currentTool = "Pencil";

    // For storing the image
    private BufferedImage image;

    // For all shapes
    private Point startPoint;
    private Point endPoint;

    // For pencil and eraser
    private ArrayList<ArrayList<Point>> lines = new ArrayList<>();
    private ArrayList<Color> lineColors = new ArrayList<>();

    // For shapes
    private ArrayList<Shape> shapes = new ArrayList<>();
    private ArrayList<Color> shapeColors = new ArrayList<>();

    public PaintPanel() {
        setBackground(Color.WHITE);

        // Create a new list for the current drawing
        lines.add(new ArrayList<>());
        lineColors.add(currentColor);

        // Add mouse listeners
        MouseAdapter mouseAdapter = new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                startPoint = e.getPoint();

                if (currentTool.equals("Fill")) {
                    // Perform flood fill
                    floodFill(e.getPoint());
                } else if (currentTool.equals("Pencil") || currentTool.equals("Eraser")) {
                    // Create a new line
                    ArrayList<Point> newLine = new ArrayList<>();
                    newLine.add(startPoint);
                    lines.add(newLine);

                    // Add color (white for eraser, current color for pencil)
                    Color lineColor = currentTool.equals("Eraser") ? getBackground() : currentColor;
                    lineColors.add(lineColor);
                }
            }

            @Override
            public void mouseDragged(MouseEvent e) {
                endPoint = e.getPoint();

                if (currentTool.equals("Pencil") || currentTool.equals("Eraser")) {
                    // Add point to the current line
                    lines.get(lines.size() - 1).add(endPoint);
                }

                repaint();
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                endPoint = e.getPoint();

                if (!currentTool.equals("Pencil") && !currentTool.equals("Eraser") && !currentTool.equals("Fill")) {
                    // Create a shape
                    Shape newShape = createShape();
                    if (newShape != null) {
                        shapes.add(newShape);
                        shapeColors.add(currentColor);
                    }
                }

                repaint();
            }
        };

        addMouseListener(mouseAdapter);
        addMouseMotionListener(mouseAdapter);

        // Add component listener for resize events
        addComponentListener(this);
    }

    /**
     * Clears all drawn content from the canvas
     */
    public void clearAll() {
        // Clear all lines
        lines.clear();
        lineColors.clear();

        // Clear all shapes
        shapes.clear();
        shapeColors.clear();

        // Clear the image buffer
        image = null;

        // Create a new empty line list
        lines.add(new ArrayList<>());
        lineColors.add(currentColor);

        // Repaint the panel
        repaint();
    }

    /**
     * Performs a flood fill starting at the specified point
     */
    private void floodFill(Point point) {
        // First, we need to ensure we have an image to work with
        if (image == null) {
            // Create an image the size of the panel
            image = new BufferedImage(getWidth(), getHeight(), BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2 = image.createGraphics();
            g2.setColor(Color.WHITE);
            g2.fillRect(0, 0, getWidth(), getHeight());

            // Draw all current content to the image
            paintAll(g2);
            g2.dispose();
        } else {
            // Update the image with current content
            Graphics2D g2 = image.createGraphics();
            paintAll(g2);
            g2.dispose();
        }

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

        // Use a queue for the flood fill algorithm
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

            // Fill this pixel
            image.setRGB(p.x, p.y, currentColor.getRGB());

            // Add adjacent pixels to the queue
            queue.add(new Point(p.x + 1, p.y));
            queue.add(new Point(p.x - 1, p.y));
            queue.add(new Point(p.x, p.y + 1));
            queue.add(new Point(p.x, p.y - 1));
        }

        repaint();
    }

    /**
     * Paints all content to the given graphics context
     */
    private void paintAll(Graphics2D g2d) {
        // Clear with white background
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, getWidth(), getHeight());

        // Draw all completed lines
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

        // Draw all shapes
        for (int i = 0; i < shapes.size(); i++) {
            g2d.setColor(shapeColors.get(i));
            g2d.setStroke(new BasicStroke(2.0f));
            g2d.draw(shapes.get(i));
        }
    }

    /**
     * Draws a cool emoji (😎) face on the canvas with enhanced details
     */
    public void drawCoolEmoji() {
        // First, ensure we have an image to draw on
        if (image == null) {
            image = new BufferedImage(getWidth(), getHeight(), BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2 = image.createGraphics();
            g2.setColor(Color.WHITE);
            g2.fillRect(0, 0, getWidth(), getHeight());
            paintAll(g2);
            g2.dispose();
        }

        // Get graphics context for drawing
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

        // Draw black outline
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(2.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g2.drawOval(centerX - faceSize / 2, centerY - faceSize / 2, faceSize, faceSize);

        // Draw improved sunglasses
        int glassWidth = faceSize / 4;
        int glassHeight = faceSize / 6;
        int glassY = centerY - glassHeight;

        // Sunglasses frame
        g2.setColor(Color.BLACK);

        // Left lens - more oval shaped
        g2.fillRoundRect(centerX - glassWidth - 10, glassY,
                glassWidth, glassHeight, 15, 12);

        // Right lens - more oval shaped
        g2.fillRoundRect(centerX + 10, glassY,
                glassWidth, glassHeight, 15, 12);

        // Add blue-ish reflective highlight in lenses
        g2.setColor(new Color(100, 180, 255, 80));
        g2.fillRoundRect(centerX - glassWidth - 5, glassY + 3,
                glassWidth / 2, glassHeight / 3, 10, 8);
        g2.fillRoundRect(centerX + 15, glassY + 3,
                glassWidth / 2, glassHeight / 3, 10, 8);

        // Bridge connecting the lenses (curved a bit)
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(3.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));

        // Curved bridge
        QuadCurve2D bridge = new QuadCurve2D.Float(
                centerX - 10, glassY + glassHeight / 2 - 3,
                centerX, glassY + glassHeight / 2 - 8,
                centerX + 10, glassY + glassHeight / 2 - 3);
        g2.draw(bridge);

        // Temple arms (the parts that go over the ears) - slightly curved
        g2.setStroke(new BasicStroke(3f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));

        // Left temple - curved outward
        QuadCurve2D leftTemple = new QuadCurve2D.Float(
                centerX - glassWidth - 10, glassY + glassHeight / 2,
                centerX - glassWidth - 20, glassY + glassHeight / 2 + 5,
                centerX - glassWidth - 30, glassY + glassHeight + 10);
        g2.draw(leftTemple);

        // Right temple - curved outward
        QuadCurve2D rightTemple = new QuadCurve2D.Float(
                centerX + glassWidth + 10, glassY + glassHeight / 2,
                centerX + glassWidth + 20, glassY + glassHeight / 2 + 5,
                centerX + glassWidth + 30, glassY + glassHeight + 10);
        g2.draw(rightTemple);

        // Draw smile - smoother, more natural curve
        int smileWidth = faceSize / 2;
        int smileHeight = faceSize / 6;
        int smileY = centerY + faceSize / 8;

        // Using a curved shape for the smile
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(3.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));

        // Create a smoother smile with cubic curve
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

        // If we have an image from flood fill or emoji, draw it first
        if (image != null) {
            g2d.drawImage(image, 0, 0, null);
        }

        // Draw all completed lines
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

        // Draw all shapes
        for (int i = 0; i < shapes.size(); i++) {
            g2d.setColor(shapeColors.get(i));
            g2d.setStroke(new BasicStroke(2.0f));
            g2d.draw(shapes.get(i));
        }

        // Draw current shape preview
        if (startPoint != null && endPoint != null &&
                !currentTool.equals("Pencil") && !currentTool.equals("Eraser") && !currentTool.equals("Fill")) {
            g2d.setColor(currentColor);
            g2d.setStroke(new BasicStroke(2.0f));
            Shape previewShape = createShape();
            if (previewShape != null) {
                g2d.draw(previewShape);
            }
        }
    }

    private Shape createShape() {
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

    public void setCurrentColor(Color color) {
        this.currentColor = color;
    }

    public void setCurrentTool(String tool) {
        this.currentTool = tool;
    }

    // ComponentListener methods
    @Override
    public void componentResized(ComponentEvent e) {
        // Create a new image with the new size
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
    }

    @Override
    public void componentShown(ComponentEvent e) {
    }

    @Override
    public void componentHidden(ComponentEvent e) {
    }
}