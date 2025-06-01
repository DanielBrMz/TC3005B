/*
 * Java Paint Application with Enhanced Color Management
 * Team 34
 * 
 * Enhanced with:
 * - Visual color indicator panels
 * - Left-click only drawing
 * - Right-click fill color selection
 * - Shape filling capabilities
 */

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class PaintApp extends JFrame {
    private PaintPanel paintPanel;
    private Color currentColor = Color.BLACK;      // Stroke/outline color
    private Color currentFillColor = Color.WHITE;  // Fill color for shapes
    private String currentTool = "Pencil";
    private ButtonGroup toolGroup;
    
    // Visual indicators for current colors
    private JPanel strokeColorPanel;
    private JPanel fillColorPanel;

    // Konami code sequence
    private final List<Integer> KONAMI_CODE = Arrays.asList(
            KeyEvent.VK_UP, KeyEvent.VK_UP, KeyEvent.VK_DOWN, KeyEvent.VK_DOWN,
            KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT, KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT,
            KeyEvent.VK_B, KeyEvent.VK_A);
    private ArrayList<Integer> keySequence = new ArrayList<>();

    public PaintApp() {
        // Set up the frame
        super("Java Paint App - Enhanced");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(900, 650); // Slightly larger to accommodate new panels
        setLayout(new BorderLayout());

        // Create the painting panel
        paintPanel = new PaintPanel();
        add(paintPanel, BorderLayout.CENTER);

        // Create toolbar
        JPanel toolBar = new JPanel();
        toolBar.setLayout(new FlowLayout(FlowLayout.LEFT));

        // Tool buttons
        toolGroup = new ButtonGroup();

        // Create pencil button
        JToggleButton pencilButton = new JToggleButton("Pencil");
        pencilButton.setSelected(true); // Default selected
        pencilButton.addActionListener(e -> currentTool = "Pencil");
        toolGroup.add(pencilButton);
        toolBar.add(pencilButton);

        // Create rectangle button
        JToggleButton rectangleButton = new JToggleButton("Rectangle");
        rectangleButton.addActionListener(e -> currentTool = "Rectangle");
        toolGroup.add(rectangleButton);
        toolBar.add(rectangleButton);

        // Create oval button
        JToggleButton ovalButton = new JToggleButton("Oval");
        ovalButton.addActionListener(e -> currentTool = "Oval");
        toolGroup.add(ovalButton);
        toolBar.add(ovalButton);

        // Create clear button
        JButton clearButton = new JButton("Clear");
        clearButton.addActionListener(e -> {
            paintPanel.clearAll();
        });
        toolBar.add(clearButton);

        // Create eraser button
        JToggleButton eraserButton = new JToggleButton("Eraser");
        eraserButton.addActionListener(e -> currentTool = "Eraser");
        toolGroup.add(eraserButton);
        toolBar.add(eraserButton);

        // Fill (bucket) button
        JToggleButton fillButton = new JToggleButton("Fill");
        fillButton.addActionListener(e -> currentTool = "Fill");
        toolGroup.add(fillButton);
        toolBar.add(fillButton);

        // Add separator for visual organization
        toolBar.add(new JSeparator(SwingConstants.VERTICAL));
        
        // Create color indicator panels
        createColorIndicators(toolBar);
        
        // Add another separator
        toolBar.add(new JSeparator(SwingConstants.VERTICAL));

        // Add color selection buttons
        Color[] colors = {
                Color.BLACK, Color.DARK_GRAY, Color.GRAY, Color.LIGHT_GRAY, Color.WHITE,
                Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW, Color.MAGENTA
        };

        // Add instruction label for color selection
        JLabel colorLabel = new JLabel("Colors (L-click: stroke, R-click: fill):");
        colorLabel.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 10));
        toolBar.add(colorLabel);

        for (Color color : colors) {
            JButton colorButton = new JButton();
            colorButton.setBackground(color);
            colorButton.setPreferredSize(new Dimension(30, 30));
            
            // Add mouse listener to handle left and right clicks differently
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
            });
            toolBar.add(colorButton);
        }

        add(toolBar, BorderLayout.NORTH);

        // Set initial values to paint panel
        paintPanel.setCurrentColor(currentColor);
        paintPanel.setCurrentFillColor(currentFillColor);
        paintPanel.setCurrentTool(currentTool);

        // Add listeners for tool change
        ActionListener toolListener = e -> {
            JToggleButton source = (JToggleButton) e.getSource();
            paintPanel.setCurrentTool(source.getText());
        };

        pencilButton.addActionListener(toolListener);
        rectangleButton.addActionListener(toolListener);
        ovalButton.addActionListener(toolListener);
        eraserButton.addActionListener(toolListener);
        fillButton.addActionListener(toolListener);

        // Add KeyListener for Konami code to the paint panel
        paintPanel.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                handleKonamiCode(e.getKeyCode());
            }
        });

        // Make sure the paint panel can receive key events
        paintPanel.setFocusable(true);
        paintPanel.requestFocus();

        // Add mouse listener to ensure focus when clicked
        paintPanel.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                paintPanel.requestFocus();
            }
        });

        setVisible(true);
    }

    /**
     * Creates visual indicators showing current stroke and fill colors
     */
    private void createColorIndicators(JPanel toolBar) {
        // Stroke color indicator
        JLabel strokeLabel = new JLabel("Stroke:");
        strokeLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 12));
        toolBar.add(strokeLabel);
        
        strokeColorPanel = new JPanel();
        strokeColorPanel.setBackground(currentColor);
        strokeColorPanel.setPreferredSize(new Dimension(40, 30));
        strokeColorPanel.setBorder(BorderFactory.createLoweredBevelBorder());
        strokeColorPanel.setToolTipText("Current stroke/outline color");
        toolBar.add(strokeColorPanel);
        
        // Fill color indicator
        JLabel fillLabel = new JLabel("Fill:");
        fillLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 12));
        toolBar.add(fillLabel);
        
        fillColorPanel = new JPanel();
        fillColorPanel.setBackground(currentFillColor);
        fillColorPanel.setPreferredSize(new Dimension(40, 30));
        fillColorPanel.setBorder(BorderFactory.createLoweredBevelBorder());
        fillColorPanel.setToolTipText("Current fill color for shapes");
        toolBar.add(fillColorPanel);
    }
    
    /**
     * Updates the visual color indicator panels
     */
    private void updateColorIndicators() {
        strokeColorPanel.setBackground(currentColor);
        fillColorPanel.setBackground(currentFillColor);
        // Force repaint of the color panels
        strokeColorPanel.repaint();
        fillColorPanel.repaint();
    }

    private void handleKonamiCode(int keyCode) {
        // Debug: Print the key that was pressed
        String keyName = KeyEvent.getKeyText(keyCode);
        System.out.println("Key pressed: " + keyName + " (KeyCode: " + keyCode + ")");

        keySequence.add(keyCode);

        // Debug: Print current sequence
        System.out.print("Current sequence: ");
        for (int key : keySequence) {
            System.out.print(KeyEvent.getKeyText(key) + " ");
        }
        System.out.println();

        // Keep only the last 10 keys (length of Konami code)
        if (keySequence.size() > KONAMI_CODE.size()) {
            keySequence.remove(0);
        }

        if (keySequence.size() == 1) {
            System.out.print("Expected sequence: ");
            for (int key : KONAMI_CODE) {
                System.out.print(KeyEvent.getKeyText(key) + " ");
            }
            System.out.println();
        }

        // Check if the sequence matches the Konami code
        if (keySequence.size() == KONAMI_CODE.size() && keySequence.equals(KONAMI_CODE)) {
            System.out.println("KONAMI CODE ACTIVATED!");
            paintPanel.drawCoolEmoji();
            keySequence.clear(); // Reset the sequence
            JOptionPane.showMessageDialog(this, "Konami Code Activated! 😎", "Easter Egg",
                    JOptionPane.INFORMATION_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new PaintApp());
    }
}