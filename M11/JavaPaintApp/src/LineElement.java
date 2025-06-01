/**
 * LineElement.java
 * 
 * Represents a freehand line drawn with the pencil tool.
 * This class encapsulates everything needed to recreate a smooth pencil stroke:
 * the series of points the user drew through, and the color they used.
 * 
 * The key insight here is that a smooth curve drawn by a user is actually composed
 * of many small straight line segments connecting the points where we sampled
 * their mouse position. When drawn quickly enough, these segments create the
 * illusion of a smooth curve.
 * 
 * This is similar to how movies work - they're actually a series of still images
 * shown rapidly to create the illusion of motion.
 */

import java.awt.*;
import java.util.ArrayList;

public class LineElement extends DrawingElement {
    private ArrayList<Point> points;
    
    /**
     * Creates a new line element from a series of points and a color.
     * 
     * We create a defensive copy of the points list to prevent external
     * code from modifying our internal data after the line is created.
     * This is an important principle called "defensive programming" - we
     * protect our object's internal state from unexpected changes.
     * 
     * @param points The series of points that make up this line
     * @param strokeColor The color to draw this line in
     */
    public LineElement(ArrayList<Point> points, Color strokeColor) {
        super(strokeColor);
        // Create a deep copy to prevent external modification
        this.points = new ArrayList<>(points);
    }
    
    /**
     * Renders this line element by drawing connected line segments.
     * 
     * The technique here is to connect consecutive points with straight lines.
     * When the points are close together (which they usually are when the user
     * draws at normal speed), this creates a very smooth-looking curve.
     * 
     * We use rounded line caps and joins to make the line look more natural,
     * similar to how a real pencil or brush would behave.
     */
    @Override
    public void draw(Graphics2D g2d) {
        // Only draw if we have at least two points
        // A single point doesn't make a visible line
        if (points.size() > 1) {
            g2d.setColor(strokeColor);
            
            // Configure the line style for smooth, natural-looking strokes
            g2d.setStroke(new BasicStroke(
                2.0f,                           // Line width
                BasicStroke.CAP_ROUND,          // Rounded line ends
                BasicStroke.JOIN_ROUND          // Rounded line joints
            ));
            
            // Draw line segments connecting consecutive points
            // This creates the smooth curve effect
            for (int i = 0; i < points.size() - 1; i++) {
                Point p1 = points.get(i);
                Point p2 = points.get(i + 1);
                g2d.drawLine(p1.x, p1.y, p2.x, p2.y);
            }
        }
    }
    
    /**
     * Gets the number of points in this line.
     * This can be useful for analyzing drawing complexity or debugging.
     * 
     * @return The number of points that make up this line
     */
    public int getPointCount() {
        return points.size();
    }
    
    /**
     * Gets a copy of the points that make up this line.
     * We return a copy to maintain encapsulation - external code can't
     * modify our internal point data.
     * 
     * @return A copy of the points in this line
     */
    public ArrayList<Point> getPoints() {
        return new ArrayList<>(points);
    }
}