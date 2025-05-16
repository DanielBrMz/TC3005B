import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;

public class PaintPanel extends JPanel {
    private Color currentColor = Color.BLACK;
    private String currentTool = "Pencil";
    
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
                
                if (currentTool.equals("Pencil") || currentTool.equals("Eraser")) {
                    // Create a new line
                    ArrayList<Point> newLine = new ArrayList<>();
                    newLine.add(startPoint);
                    lines.add(newLine);
                    
                    // Add color (white for eraser)
                    Color lineColor = currentTool.equals("Eraser") ? Color.WHITE : currentColor;
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
                
                if (!currentTool.equals("Pencil") && !currentTool.equals("Eraser")) {
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
    }
    
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;
        
        // Draw all completed lines
        for (int i = 0; i < lines.size(); i++) {
            ArrayList<Point> line = lines.get(i);
            if (line.size() > 1) {
                g2d.setColor(lineColors.get(i));
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
            g2d.draw(shapes.get(i));
        }
        
        // Draw current shape preview
        if (startPoint != null && endPoint != null && 
            !currentTool.equals("Pencil") && !currentTool.equals("Eraser")) {
            g2d.setColor(currentColor);
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
            case "Arc":
                return new java.awt.geom.Arc2D.Double(x, y, width, height, 0, 90, java.awt.geom.Arc2D.OPEN);
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
}