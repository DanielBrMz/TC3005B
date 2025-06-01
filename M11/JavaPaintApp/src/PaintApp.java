/**
 * PaintApp.java
 * 
 * Main application class that coordinates the entire paint application.
 * This class is responsible for setting up the user interface, managing
 * the relationship between UI components and the drawing canvas, and
 * handling application-level events like the Konami code easter egg.
 * 
 * This modular design separates concerns clearly:
 * - PaintApp: UI coordination and application logic
 * - PaintPanel: Drawing canvas and user interaction
 * - DrawingSystem: Timeline management for proper layering
 * - DrawingElement hierarchy: Individual drawable items
 * 
 * When compiled, this will produce exactly 5 .class files:
 * - PaintApp.class
 * - PaintPanel.class  
 * - DrawingSystem.class
 * - DrawingElement.class
 * - LineElement.class
 * - ShapeElement.class
 */

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class PaintApp extends JFrame {
    // Core application components
    private PaintPanel paintPanel;
    private Color currentColor = Color.BLACK;      // Stroke/outline color
    private Color currentFillColor = Color.WHITE;  // Fill color for shapes
    private String currentTool = "Pencil";
    private ButtonGroup toolGroup;
    
    // Visual indicators for current colors
    private JPanel strokeColorPanel;
    private JPanel fillColorPanel;

    // Konami code sequence for easter egg functionality
    private final List<Integer> KONAMI_CODE = Arrays.asList(
            KeyEvent.VK_UP, KeyEvent.VK_UP, KeyEvent.VK_DOWN, KeyEvent.VK_DOWN,
            KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT, KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT,
            KeyEvent.VK_B, KeyEvent.VK_A);
    private ArrayList<Integer> keySequence = new ArrayList<>();

    /**
     * Constructor sets up the entire application UI and establishes component relationships.
     * This method demonstrates good software architecture by separating UI setup
     * into logical, manageable pieces.
     */
    public PaintApp() {
        super("Java Paint App - Modular & Bug-Free");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1000, 700);
        setLayout(new BorderLayout());

        // Create the central drawing canvas
        paintPanel = new PaintPanel();
        add(paintPanel, BorderLayout.CENTER);

        // Build the comprehensive toolbar
        createToolbar();

        // Establish initial state synchronization between UI and canvas
        synchronizeInitialState();

        // Set up keyboard interaction for easter egg
        setupKeyboardHandling();

        // Center the window on screen for better user experience
        setLocationRelativeTo(null);
        setVisible(true);
    }

    /**
     * Creates a well-organized toolbar with all tools, color indicators, and color palette.
     * This method demonstrates good UI design principles by grouping related functionality
     * and providing clear visual separation between different tool categories.
     */
    private void createToolbar() {
        JPanel toolBar = new JPanel(new FlowLayout(FlowLayout.LEFT));
        toolGroup = new ButtonGroup();

        // Drawing tool section
        addDrawingTools(toolBar);
        
        // Visual separator for better organization
        toolBar.add(Box.createHorizontalStrut(10));
        toolBar.add(new JSeparator(SwingConstants.VERTICAL));
        toolBar.add(Box.createHorizontalStrut(10));
        
        // Color indicator section
        createColorIndicators(toolBar);
        
        // Another visual separator
        toolBar.add(Box.createHorizontalStrut(10));
        toolBar.add(new JSeparator(SwingConstants.VERTICAL));
        toolBar.add(Box.createHorizontalStrut(10));
        
        // Color palette section
        createColorPalette(toolBar);

        add(toolBar, BorderLayout.NORTH);
    }

    /**
     * Adds all drawing tool buttons with proper grouping and event handling.
     * Each tool button is configured with consistent behavior and helpful tooltips.
     */
    private void addDrawingTools(JPanel toolBar) {
        // Pencil tool (default selection)
        JToggleButton pencilButton = new JToggleButton("Pencil");
        pencilButton.setSelected(true);
        setupToolButton(pencilButton, "Pencil", "Draw freehand lines", toolBar);

        // Shape drawing tools
        setupToolButton(new JToggleButton("Rectangle"), "Rectangle", "Draw rectangles", toolBar);
        setupToolButton(new JToggleButton("Oval"), "Oval", "Draw ovals and circles", toolBar);

        // Utility tools
        JButton clearButton = new JButton("Clear");
        clearButton.addActionListener(e -> paintPanel.clearAll());
        clearButton.setToolTipText("Clear the entire canvas");
        clearButton.setBackground(new Color(255, 200, 200)); // Light red to indicate destructive action
        toolBar.add(clearButton);

        // Modification tools
        setupToolButton(new JToggleButton("Eraser"), "Eraser", "Erase parts of the drawing", toolBar);
        setupToolButton(new JToggleButton("Fill"), "Fill", "Fill enclosed areas with color", toolBar);
    }

    /**
     * Helper method to set up individual tool buttons with consistent behavior.
     * This reduces code duplication and ensures all tool buttons behave the same way.
     * 
     * @param button The toggle button to configure
     * @param toolName The name of the tool (used for internal identification)
     * @param tooltip The tooltip text to show on hover
     * @param toolBar The toolbar to add the button to
     */
    private void setupToolButton(JToggleButton button, String toolName, String tooltip, JPanel toolBar) {
        button.addActionListener(e -> {
            currentTool = toolName;
            paintPanel.setCurrentTool(toolName);
        });
        button.setToolTipText(tooltip);
        button.setPreferredSize(new Dimension(80, 30)); // Consistent button sizing
        toolGroup.add(button);
        toolBar.add(button);
    }

    /**
     * Creates visual indicators that show the current stroke and fill colors.
     * These provide immediate visual feedback about the current color state,
     * which is especially important when using right-click to set fill colors.
     */
    private void createColorIndicators(JPanel toolBar) {
        // Stroke color indicator
        JLabel strokeLabel = new JLabel("Stroke:");
        strokeLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 12));
        toolBar.add(strokeLabel);
        
        strokeColorPanel = new JPanel();
        strokeColorPanel.setBackground(currentColor);
        strokeColorPanel.setPreferredSize(new Dimension(50, 30));
        strokeColorPanel.setBorder(BorderFactory.createLoweredBevelBorder());
        strokeColorPanel.setToolTipText("Current stroke/outline color");
        toolBar.add(strokeColorPanel);
        
        // Fill color indicator
        JLabel fillLabel = new JLabel("Fill:");
        fillLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 12));
        toolBar.add(fillLabel);
        
        fillColorPanel = new JPanel();
        fillColorPanel.setBackground(currentFillColor);
        fillColorPanel.setPreferredSize(new Dimension(50, 30));
        fillColorPanel.setBorder(BorderFactory.createLoweredBevelBorder());
        fillColorPanel.setToolTipText("Current fill color for shapes");
        toolBar.add(fillColorPanel);
    }

    /**
     * Creates the color palette with intuitive left-click/right-click behavior.
     * This interface design allows users to quickly set both stroke and fill colors
     * without needing separate color selection dialogs.
     */
    private void createColorPalette(JPanel toolBar) {
        // Instruction label to help users understand the interaction model
        JLabel instructionLabel = new JLabel("Colors (Left-click: stroke, Right-click: fill):");
        instructionLabel.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 10));
        toolBar.add(instructionLabel);

        // Standard color palette with commonly used colors
        Color[] colors = {
                Color.BLACK, Color.DARK_GRAY, Color.GRAY, Color.LIGHT_GRAY, Color.WHITE,
                Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW, Color.MAGENTA,
                Color.CYAN, Color.ORANGE, Color.PINK, new Color(128, 0, 128), new Color(139, 69, 19) // Purple, Brown
        };

        for (Color color : colors) {
            JButton colorButton = new JButton();
            colorButton.setBackground(color);
            colorButton.setPreferredSize(new Dimension(25, 25));
            colorButton.setBorder(BorderFactory.createRaisedBevelBorder());
            colorButton.setToolTipText(String.format("RGB(%d,%d,%d) - Left: stroke, Right: fill", 
                                     color.getRed(), color.getGreen(), color.getBlue()));
            
            // Sophisticated mouse handling for dual-purpose color selection
            colorButton.addMouseListener(new MouseAdapter() {
                @Override
                public void mouseClicked(MouseEvent e) {
                    if (SwingUtilities.isLeftMouseButton(e)) {
                        // Left click sets stroke color
                        currentColor = color;
                        paintPanel.setCurrentColor(currentColor);
                        updateColorIndicators();
                    } else if (SwingUtilities.isRightMouseButton(e)) {
                        // Right click sets fill color
                        currentFillColor = color;
                        paintPanel.setCurrentFillColor(currentFillColor);
                        updateColorIndicators();
                    }
                }
                
                @Override
                public void mouseEntered(MouseEvent e) {
                    // Visual feedback when hovering over color buttons
                    colorButton.setBorder(BorderFactory.createLoweredBevelBorder());
                }
                
                @Override
                public void mouseExited(MouseEvent e) {
                    // Return to normal appearance when not hovering
                    colorButton.setBorder(BorderFactory.createRaisedBevelBorder());
                }
            });
            toolBar.add(colorButton);
        }

        // Add a custom color button for advanced users
        JButton customColorButton = new JButton("...");
        customColorButton.setPreferredSize(new Dimension(25, 25));
        customColorButton.setToolTipText("Choose custom color");
        customColorButton.addActionListener(e -> showCustomColorDialog());
        toolBar.add(customColorButton);
    }

    /**
     * Shows a custom color selection dialog for advanced color picking.
     * This provides access to the full color spectrum beyond the basic palette.
     */
    private void showCustomColorDialog() {
        Color newColor = JColorChooser.showDialog(this, "Choose Custom Color", currentColor);
        if (newColor != null) {
            currentColor = newColor;
            paintPanel.setCurrentColor(currentColor);
            updateColorIndicators();
        }
    }

    /**
     * Synchronizes the initial state between the main application and the paint panel.
     * This ensures that the UI and the drawing canvas start in a consistent state.
     */
    private void synchronizeInitialState() {
        paintPanel.setCurrentColor(currentColor);
        paintPanel.setCurrentFillColor(currentFillColor);
        paintPanel.setCurrentTool(currentTool);
    }

    /**
     * Sets up keyboard handling for the Konami code easter egg.
     * This demonstrates how to add hidden features that enhance user delight
     * without cluttering the main interface.
     */
    private void setupKeyboardHandling() {
        paintPanel.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                handleKonamiCode(e.getKeyCode());
            }
        });

        paintPanel.setFocusable(true);
        paintPanel.requestFocus();

        // Ensure the paint panel maintains focus when clicked
        paintPanel.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                paintPanel.requestFocus();
            }
        });
    }

    /**
     * Updates the visual color indicator panels to reflect current color selections.
     * This provides immediate visual feedback when colors are changed.
     */
    private void updateColorIndicators() {
        strokeColorPanel.setBackground(currentColor);
        fillColorPanel.setBackground(currentFillColor);
        strokeColorPanel.repaint();
        fillColorPanel.repaint();
    }

    /**
     * Handles the Konami code sequence detection for the easter egg feature.
     * This is a fun addition that demonstrates attention to detail and user delight.
     * 
     * The Konami code is: ↑↑↓↓←→←→BA
     */
    private void handleKonamiCode(int keyCode) {
        keySequence.add(keyCode);

        // Keep only the last 10 keys (length of Konami code)
        if (keySequence.size() > KONAMI_CODE.size()) {
            keySequence.remove(0);
        }

        // Check if the sequence matches the Konami code
        if (keySequence.size() == KONAMI_CODE.size() && keySequence.equals(KONAMI_CODE)) {
            System.out.println("KONAMI CODE ACTIVATED!");
            paintPanel.drawCoolEmoji();
            keySequence.clear(); // Reset for next activation
            
            // Show a celebratory message
            SwingUtilities.invokeLater(() -> {
                JOptionPane.showMessageDialog(this, 
                    "Konami Code Activated! 😎\n\nYou found the secret easter egg!", 
                    "Easter Egg Unlocked", 
                    JOptionPane.INFORMATION_MESSAGE);
            });
        }
    }

    /**
     * Application entry point.
     * Uses the Event Dispatch Thread for proper Swing threading.
     */
    public static void main(String[] args) {
        // Set the look and feel to match the system for better integration
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            // Fall back to default look and feel if system LAF fails
            System.out.println("Could not set system look and feel, using default.");
        }
        
        // Launch the application on the Event Dispatch Thread
        SwingUtilities.invokeLater(() -> new PaintApp());
    }
}