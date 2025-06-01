/**
 * Enhanced LineElement.java - Pencil strokes with variable stroke width
 */
import java.awt.*;
import java.util.ArrayList;

public class LineElement extends DrawingElement {
    private ArrayList<Point> points;
    
    /**
     * Creates a line element with variable stroke width.
     * This constructor enables artistic expression through line weight variation.
     */
    public LineElement(ArrayList<Point> points, Color strokeColor, int strokeWidth) {
        super(strokeColor, strokeWidth);
        this.points = new ArrayList<>(points);
    }
    
    /**
     * Backward compatibility constructor with default stroke width.
     */
    public LineElement(ArrayList<Point> points, Color strokeColor) {
        this(points, strokeColor, 2);
    }
    
    /**
     * Enhanced drawing method that respects stroke width settings.
     * Creates professional-quality line rendering with smooth curves and proper thickness.
     */
    @Override
    public void draw(Graphics2D g2d) {
        if (points.size() > 1) {
            g2d.setColor(strokeColor);
            
            // Create stroke with the specified width and professional appearance
            g2d.setStroke(new BasicStroke(
                strokeWidth,                    // Use the stored stroke width
                BasicStroke.CAP_ROUND,          // Rounded line ends for natural appearance
                BasicStroke.JOIN_ROUND          // Rounded joints for smooth curves
            ));
            
            // Draw connected line segments for smooth curves
            // This technique creates natural-looking strokes regardless of stroke width
            for (int i = 0; i < points.size() - 1; i++) {
                Point p1 = points.get(i);
                Point p2 = points.get(i + 1);
                g2d.drawLine(p1.x, p1.y, p2.x, p2.y);
            }
        }
    }
    
    public int getPointCount() {
        return points.size();
    }
    
    public ArrayList<Point> getPoints() {
        return new ArrayList<>(points);
    }
}