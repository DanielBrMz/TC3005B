/**
 * Manages chronological timeline of drawing elements for proper layering.
 * Ensures drawings appear in creation order rather than type-based order.
 */
import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class DrawingSystem {
    private ArrayList<DrawingElement> elements = new ArrayList<>();
    
    public void addElement(DrawingElement element) {
        if (element != null) {
            elements.add(element);
        }
    }
    
    public void renderAll(Graphics2D g2d, int width, int height) {
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, width, height);
        
        for (DrawingElement element : elements) {
            element.draw(g2d);
        }
    }
    
    public void clear() {
        elements.clear();
    }
    
    public boolean isEmpty() {
        return elements.isEmpty();
    }
    
    public int size() {
        return elements.size();
    }
    
    public List<DrawingElement> getElements() {
        return new ArrayList<>(elements);
    }
    
    public DrawingElement removeLastElement() {
        if (!elements.isEmpty()) {
            return elements.remove(elements.size() - 1);
        }
        return null;
    }
    
    public Rectangle getTotalBounds() {
        if (elements.isEmpty()) return null;
        
        Rectangle totalBounds = null;
        for (DrawingElement element : elements) {
            Rectangle bounds = null;
            
            if (element instanceof ShapeElement) {
                bounds = ((ShapeElement) element).getBounds();
            } else if (element instanceof LineElement) {
                ArrayList<Point> points = ((LineElement) element).getPoints();
                if (!points.isEmpty()) {
                    int minX = points.get(0).x, maxX = points.get(0).x;
                    int minY = points.get(0).y, maxY = points.get(0).y;
                    
                    for (Point p : points) {
                        minX = Math.min(minX, p.x);
                        maxX = Math.max(maxX, p.x);
                        minY = Math.min(minY, p.y);
                        maxY = Math.max(maxY, p.y);
                    }
                    bounds = new Rectangle(minX, minY, maxX - minX, maxY - minY);
                }
            }
            
            if (bounds != null) {
                totalBounds = (totalBounds == null) ? 
                    new Rectangle(bounds) : totalBounds.union(bounds);
            }
        }
        return totalBounds;
    }
}