/**
 * Base class for all drawable elements in the paint application.
 * Provides common interface for temporal layering system.
 */
import java.awt.*;

public abstract class DrawingElement {
    protected Color strokeColor;
    
    public DrawingElement(Color strokeColor) {
        this.strokeColor = strokeColor;
    }
    
    public abstract void draw(Graphics2D g2d);
    
    public Color getStrokeColor() {
        return strokeColor;
    }
}