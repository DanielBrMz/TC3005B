/**
 * Represents geometric shapes (rectangles, ovals) with fill and stroke.
 * Renders fill first, then outline for proper visual layering.
 */
import java.awt.*;

public class ShapeElement extends DrawingElement {
    private Shape shape;
    private Color fillColor;
    private boolean isFilled;
    
    public ShapeElement(Shape shape, Color strokeColor, Color fillColor, boolean isFilled) {
        super(strokeColor);
        this.shape = shape;
        this.fillColor = fillColor;
        this.isFilled = isFilled;
    }
    
    @Override
    public void draw(Graphics2D g2d) {
        // Fill first, then stroke
        if (isFilled) {
            g2d.setColor(fillColor);
            g2d.fill(shape);
        }
        
        g2d.setColor(strokeColor);
        g2d.setStroke(new BasicStroke(2.0f));
        g2d.draw(shape);
    }
    
    public Color getFillColor() {
        return fillColor;
    }
    
    public boolean isFilled() {
        return isFilled;
    }
    
    public Shape getShape() {
        return shape;
    }
    
    public Rectangle getBounds() {
        return shape.getBounds();
    }
}