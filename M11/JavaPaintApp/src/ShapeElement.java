/**
 * ShapeElement.java
 * 
 * Represents geometric shapes (rectangles and ovals) with both outline and fill capabilities.
 * This class demonstrates how different drawing elements can have vastly different
 * rendering logic while still participating in the unified drawing system.
 * 
 * Unlike LineElement which deals with curves made of many points, ShapeElement
 * deals with mathematical shapes defined by geometric formulas. This shows the
 * power of polymorphism - both can be "drawn" but in completely different ways.
 * 
 * The concept of having both fill and stroke colors comes from traditional art
 * where you might fill a shape with one color and then outline it with another.
 */

import java.awt.*;

public class ShapeElement extends DrawingElement {
    private Shape shape;           // The geometric shape (Rectangle, Ellipse, etc.)
    private Color fillColor;       // Color to fill the interior
    private boolean isFilled;      // Whether to actually fill the shape
    
    /**
     * Creates a new shape element with complete styling information.
     * 
     * This constructor demonstrates the principle of "complete initialization" -
     * we provide everything the shape needs to render itself correctly right
     * from the moment it's created. This prevents issues where objects might
     * be used before they're fully configured.
     * 
     * @param shape The geometric shape to draw (Rectangle, Ellipse, etc.)
     * @param strokeColor The color for the outline
     * @param fillColor The color for the interior
     * @param isFilled Whether to actually fill the interior with color
     */
    public ShapeElement(Shape shape, Color strokeColor, Color fillColor, boolean isFilled) {
        super(strokeColor);
        this.shape = shape;
        this.fillColor = fillColor;
        this.isFilled = isFilled;
    }
    
    /**
     * Renders this shape element with proper fill and stroke ordering.
     * 
     * The critical aspect here is the rendering order: we MUST fill first,
     * then draw the outline. If we did it the other way around, the fill
     * would cover up the outline, making it invisible or less crisp.
     * 
     * This is similar to real painting - you'd fill in a region with a brush,
     * then use a fine pen to draw a crisp outline on top.
     */
    @Override
    public void draw(Graphics2D g2d) {
        // Phase 1: Fill the interior if requested
        // This happens first so the outline appears on top
        if (isFilled) {
            g2d.setColor(fillColor);
            g2d.fill(shape);
        }
        
        // Phase 2: Draw the outline
        // This appears on top of the fill, creating a crisp border
        g2d.setColor(strokeColor);
        g2d.setStroke(new BasicStroke(2.0f));
        g2d.draw(shape);
    }
    
    /**
     * Gets the fill color for this shape.
     * This can be useful for tools that need to inspect existing shapes.
     * 
     * @return The fill color of this shape
     */
    public Color getFillColor() {
        return fillColor;
    }
    
    /**
     * Returns whether this shape is filled.
     * 
     * @return true if this shape has a filled interior, false if outline only
     */
    public boolean isFilled() {
        return isFilled;
    }
    
    /**
     * Gets the geometric shape object.
     * This could be useful for advanced operations like hit testing
     * (determining if a point is inside the shape).
     * 
     * @return The Shape object representing this element's geometry
     */
    public Shape getShape() {
        return shape;
    }
    
    /**
     * Gets the bounds of this shape.
     * This is useful for operations like determining what area needs to be
     * repainted when the shape changes, or for collision detection.
     * 
     * @return A Rectangle representing the bounds of this shape
     */
    public Rectangle getBounds() {
        return shape.getBounds();
    }
}