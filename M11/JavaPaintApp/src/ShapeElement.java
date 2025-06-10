/**
 * Enhanced ShapeElement.java - Geometric shapes with variable stroke width
 */
import java.awt.*;

public class ShapeElement extends DrawingElement {
    private Shape shape;
    private Color fillColor;
    private boolean isFilled;
    
    /**
     * Creates a shape element with variable stroke width.
     * This enables professional drawing with controllable outline thickness.
     */
    public ShapeElement(Shape shape, Color strokeColor, Color fillColor, boolean isFilled, int strokeWidth) {
        super(strokeColor, strokeWidth);
        this.shape = shape;
        this.fillColor = fillColor;
        this.isFilled = isFilled;
    }
    
    /**
     * Backward compatibility constructor with default stroke width.
     */
    public ShapeElement(Shape shape, Color strokeColor, Color fillColor, boolean isFilled) {
        this(shape, strokeColor, fillColor, isFilled, 2);
    }
    
    /**
     * Enhanced drawing method with variable stroke width support.
     * Maintains proper fill-then-stroke order while respecting stroke width.
     */
    @Override
    public void draw(Graphics2D g2d) {
        // Phase 1: Fill the interior if requested
        // This must happen first so the stroke appears crisp on top
        if (isFilled) {
            g2d.setColor(fillColor);
            g2d.fill(shape);
        }
        
        // Phase 2: Draw the outline with specified stroke width
        g2d.setColor(strokeColor);
        g2d.setStroke(new BasicStroke(
            strokeWidth,                    // Use the stored stroke width
            BasicStroke.CAP_ROUND,          // Rounded line ends
            BasicStroke.JOIN_ROUND          // Rounded corners for professional appearance
        ));
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