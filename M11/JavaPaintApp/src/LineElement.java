/**
 * Represents a freehand line drawn with the pencil tool.
 * Stores points and renders smooth curves between them.
 */
import java.awt.*;
import java.util.ArrayList;

public class LineElement extends DrawingElement {
    private ArrayList<Point> points;
    
    public LineElement(ArrayList<Point> points, Color strokeColor) {
        super(strokeColor);
        this.points = new ArrayList<>(points); // Defensive copy
    }
    
    @Override
    public void draw(Graphics2D g2d) {
        if (points.size() > 1) {
            g2d.setColor(strokeColor);
            g2d.setStroke(new BasicStroke(2.0f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            
            // Connect consecutive points for smooth curves
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