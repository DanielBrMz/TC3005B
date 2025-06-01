/**
 * DrawingSystem.java
 * 
 * Manages the unified drawing system that enables proper temporal layering.
 * This class is the heart of our solution to the "drawing order" problem.
 * 
 * Think of this class as a timeline or history of all drawing operations.
 * Instead of organizing drawings by type (all lines together, all shapes together),
 * we organize them by time (when they were created). This creates natural
 * layering behavior where newer drawings appear on top of older ones.
 * 
 * This approach solves the fundamental issue where lines were always appearing
 * behind shapes regardless of when they were drawn. Now, whatever is drawn
 * most recently appears on top, just like in real painting.
 */

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class DrawingSystem {
    // The core data structure: a chronological list of all drawing elements
    // The position in this list determines the visual layering order
    private ArrayList<DrawingElement> elements = new ArrayList<>();
    
    /**
     * Adds a drawing element to the timeline, preserving chronological order.
     * 
     * This is where the magic happens for proper layering. When a drawing
     * operation completes (mouse released), we add the resulting element
     * to the end of our timeline. Since we render from beginning to end,
     * this means the most recently added elements appear on top.
     * 
     * It's like adding a new photo to the top of a stack - it becomes
     * the most visible item.
     * 
     * @param element The drawing element to add to the timeline
     */
    public void addElement(DrawingElement element) {
        if (element != null) {
            elements.add(element);
        }
    }
    
    /**
     * Renders all elements in chronological order.
     * 
     * This method implements our temporal layering system. By iterating through
     * the elements list from beginning to end, we ensure that:
     * 1. Elements drawn first appear at the bottom layer
     * 2. Elements drawn later appear on top of earlier elements
     * 3. The visual stacking order matches the creation order
     * 
     * This single loop replaces the old system that had separate loops for
     * different types of elements, which caused the layering problems.
     * 
     * @param g2d The graphics context to draw on
     * @param width The width of the drawing area
     * @param height The height of the drawing area
     */
    public void renderAll(Graphics2D g2d, int width, int height) {
        // Start with a clean white background
        // This ensures we have a consistent starting point for each render
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, width, height);
        
        // Render all elements in chronological order
        // This is the core of our temporal layering system
        for (DrawingElement element : elements) {
            element.draw(g2d); // Polymorphism in action - each element draws itself
        }
    }
    
    /**
     * Clears all drawing elements from the timeline.
     * 
     * This is equivalent to starting with a fresh canvas. All drawing
     * history is erased, and we return to the initial empty state.
     */
    public void clear() {
        elements.clear();
    }
    
    /**
     * Returns true if there are no drawing elements.
     * 
     * This can be useful for optimizing rendering - if there's nothing
     * to draw, we might skip certain expensive operations.
     * 
     * @return true if the drawing timeline is empty
     */
    public boolean isEmpty() {
        return elements.isEmpty();
    }
    
    /**
     * Returns the number of drawing elements in the timeline.
     * 
     * This can be useful for debugging, progress indicators, or
     * implementing features like "undo" with a limited history.
     * 
     * @return The number of elements in the drawing timeline
     */
    public int size() {
        return elements.size();
    }
    
    /**
     * Gets a read-only view of all drawing elements.
     * 
     * This allows external code to inspect the drawing timeline without
     * being able to modify it directly. This maintains the integrity
     * of our chronological ordering while still providing access to
     * the data for advanced operations.
     * 
     * @return A read-only list of all drawing elements
     */
    public List<DrawingElement> getElements() {
        return new ArrayList<>(elements); // Return a defensive copy
    }
    
    /**
     * Removes the most recently added element (undo functionality).
     * 
     * This provides a simple undo operation by removing the last element
     * that was added to the timeline. More sophisticated undo systems
     * might maintain a separate history stack.
     * 
     * @return The element that was removed, or null if timeline was empty
     */
    public DrawingElement removeLastElement() {
        if (!elements.isEmpty()) {
            return elements.remove(elements.size() - 1);
        }
        return null;
    }
    
    /**
     * Gets the bounds of all drawing elements combined.
     * 
     * This calculates the smallest rectangle that would contain all
     * drawing elements. This is useful for features like "zoom to fit"
     * or determining the actual content area of the drawing.
     * 
     * @return A Rectangle containing all drawing elements, or null if empty
     */
    public Rectangle getTotalBounds() {
        if (elements.isEmpty()) {
            return null;
        }
        
        Rectangle totalBounds = null;
        
        for (DrawingElement element : elements) {
            Rectangle elementBounds = null;
            
            // Get bounds depending on element type
            if (element instanceof ShapeElement) {
                elementBounds = ((ShapeElement) element).getBounds();
            } else if (element instanceof LineElement) {
                // For lines, we need to calculate bounds from points
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
                    
                    elementBounds = new Rectangle(minX, minY, maxX - minX, maxY - minY);
                }
            }
            
            // Combine with total bounds
            if (elementBounds != null) {
                if (totalBounds == null) {
                    totalBounds = new Rectangle(elementBounds);
                } else {
                    totalBounds = totalBounds.union(elementBounds);
                }
            }
        }
        
        return totalBounds;
    }
}