/**
 * DrawingElement.java
 * 
 * Abstract base class for all drawing elements in our paint application.
 * This class establishes the fundamental contract that all drawable items must follow.
 * 
 * Think of this like defining what it means to be "drawable" - any object that can
 * appear on our canvas must implement the draw() method to specify how it renders itself.
 * 
 * This is a perfect example of the Template Method pattern in object-oriented design.
 */

import java.awt.*;

public abstract class DrawingElement {
    protected Color strokeColor;
    
    /**
     * Constructor that ensures every drawing element has a stroke color.
     * This is fundamental data that every drawable item needs.
     * 
     * @param strokeColor The color used for drawing the outline or line
     */
    public DrawingElement(Color strokeColor) {
        this.strokeColor = strokeColor;
    }
    
    /**
     * Abstract method that each drawing element type must implement.
     * This method defines how the element renders itself on the graphics context.
     * 
     * This is polymorphism in action - the same method call (draw) will produce
     * different visual results depending on whether it's called on a LineElement,
     * ShapeElement, or any future drawing element types we might add.
     * 
     * @param g2d The Graphics2D context to draw on
     */
    public abstract void draw(Graphics2D g2d);
    
    /**
     * Gets the stroke color for this drawing element.
     * This can be useful for tools that need to inspect existing drawings.
     * 
     * @return The stroke color of this element
     */
    public Color getStrokeColor() {
        return strokeColor;
    }
}