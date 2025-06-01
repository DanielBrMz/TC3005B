/**
 * Enhanced DrawingElement.java - Base class with stroke width support
 */
import java.awt.*;

public abstract class DrawingElement {
    protected Color strokeColor;
    protected int strokeWidth;  // New: variable stroke width support
    
    public DrawingElement(Color strokeColor, int strokeWidth) {
        this.strokeColor = strokeColor;
        this.strokeWidth = Math.max(1, strokeWidth);  // Ensure minimum width of 1
    }
    
    // Backward compatibility constructor
    public DrawingElement(Color strokeColor) {
        this(strokeColor, 2);  // Default stroke width
    }
    
    public abstract void draw(Graphics2D g2d);
    
    public Color getStrokeColor() {
        return strokeColor;
    }
    
    public int getStrokeWidth() {
        return strokeWidth;
    }
}