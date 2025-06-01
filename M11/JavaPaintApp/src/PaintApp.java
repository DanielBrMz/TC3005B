/**
 * Enhanced Paint Application with Icons and Stroke Width Control
 * Demonstrates professional UI design with visual icons and advanced drawing controls
 */
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class PaintApp extends JFrame {
    private PaintPanel paintPanel;
    private Color currentColor = Color.BLACK;
    private Color currentFillColor = Color.WHITE;
    private String currentTool = "Pencil";
    private int currentStrokeWidth = 2;  // New: stroke width control
    private ButtonGroup toolGroup;
    
    private JPanel strokeColorPanel;
    private JPanel fillColorPanel;
    private JSlider strokeSlider;  // New: stroke width slider
    private JLabel strokeLabel;    // New: displays current stroke width

    // Konami code for easter egg
    private final List<Integer> KONAMI_CODE = Arrays.asList(
            KeyEvent.VK_UP, KeyEvent.VK_UP, KeyEvent.VK_DOWN, KeyEvent.VK_DOWN,
            KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT, KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT,
            KeyEvent.VK_B, KeyEvent.VK_A);
    private ArrayList<Integer> keySequence = new ArrayList<>();

    public PaintApp() {
        super("Java Paint App - Professional Edition with Icons");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1100, 750);  // Slightly larger to accommodate new controls
        setLayout(new BorderLayout());

        paintPanel = new PaintPanel();
        add(paintPanel, BorderLayout.CENTER);

        createToolbar();
        synchronizeInitialState();
        setupKeyboardHandling();

        setLocationRelativeTo(null);
        setVisible(true);
    }

    /**
     * Creates icons programmatically for each tool button.
     * This approach ensures icons are always available regardless of external image files.
     * Each icon is designed to be immediately recognizable and visually consistent.
     */
    private Icon createToolIcon(String toolName, int size) {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = image.createGraphics();
        
        // Enable antialiasing for smooth icon rendering
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);
        
        // Set up common drawing properties
        g2.setColor(Color.DARK_GRAY);
        g2.setStroke(new BasicStroke(1.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        
        switch (toolName) {
            case "Pencil":
                // Draw a pencil shape with tip, body, and eraser
                // Pencil tip (sharp point)
                g2.drawLine(size/4, 3*size/4, size/2, size-2);
                // Pencil body (rectangular shaft)
                g2.fillRect(size/4-1, size/4, 3, size/2);
                // Pencil eraser (small circle at top)
                g2.setColor(Color.PINK);
                g2.fillOval(size/4-2, size/4-4, 6, 4);
                // Metal ferrule (band holding eraser)
                g2.setColor(Color.GRAY);
                g2.fillRect(size/4-1, size/4-2, 3, 2);
                break;
                
            case "Rectangle":
                // Draw a simple rectangle outline
                g2.drawRect(4, 4, size-8, size-8);
                // Add a small filled rectangle inside to show it's a shape tool
                g2.setColor(Color.LIGHT_GRAY);
                g2.fillRect(6, 6, size-12, size-12);
                break;
                
            case "Oval":
                // Draw a circle/oval outline
                g2.drawOval(4, 4, size-8, size-8);
                // Add a small filled oval inside
                g2.setColor(Color.LIGHT_GRAY);
                g2.fillOval(6, 6, size-12, size-12);
                break;
                
            case "Eraser":
                // Draw an eraser shape - rectangular with rounded corners
                g2.setColor(Color.PINK);
                g2.fillRoundRect(3, 6, size-6, size-12, 4, 4);
                g2.setColor(Color.DARK_GRAY);
                g2.drawRoundRect(3, 6, size-6, size-12, 4, 4);
                // Add eraser texture lines
                g2.setStroke(new BasicStroke(0.5f));
                for (int i = 7; i < size-3; i += 3) {
                    g2.drawLine(5, i, size-5, i);
                }
                break;
                
            case "Fill":
                // Draw a paint bucket icon
                // Bucket body
                g2.drawArc(4, 8, size-8, size-12, 0, 180);
                g2.drawLine(4, 8+size/4, 4, 8+size/3);
                g2.drawLine(size-4, 8+size/4, size-4, 8+size/3);
                // Bucket handle
                g2.drawArc(size-6, 6, 8, 8, 90, 180);
                // Paint drip
                g2.setColor(Color.BLUE);
                g2.fillOval(size/2-1, 4, 3, 4);
                break;
                
            default:
                // Default icon - just a simple square
                g2.drawRect(4, 4, size-8, size-8);
                break;
        }
        
        g2.dispose();
        return new ImageIcon(image);
    }

    private void createToolbar() {
        JPanel toolBar = new JPanel(new FlowLayout(FlowLayout.LEFT));
        toolGroup = new ButtonGroup();

        addDrawingTools(toolBar);
        toolBar.add(Box.createHorizontalStrut(10));
        toolBar.add(new JSeparator(SwingConstants.VERTICAL));
        toolBar.add(Box.createHorizontalStrut(10));
        
        // Add stroke width controls - this is a major new feature
        addStrokeControls(toolBar);
        toolBar.add(Box.createHorizontalStrut(10));
        toolBar.add(new JSeparator(SwingConstants.VERTICAL));
        toolBar.add(Box.createHorizontalStrut(10));
        
        createColorIndicators(toolBar);
        toolBar.add(Box.createHorizontalStrut(10));
        toolBar.add(new JSeparator(SwingConstants.VERTICAL));
        toolBar.add(Box.createHorizontalStrut(10));
        
        createColorPalette(toolBar);
        add(toolBar, BorderLayout.NORTH);
    }

    /**
     * Creates stroke width controls including a slider and visual feedback.
     * This demonstrates advanced Swing component usage and real-time parameter adjustment.
     * The slider provides immediate feedback and updates the drawing system in real-time.
     */
    private void addStrokeControls(JPanel toolBar) {
        // Label to indicate what this section controls
        JLabel sectionLabel = new JLabel("Stroke Width:");
        sectionLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 12));
        toolBar.add(sectionLabel);
        
        // Slider for stroke width adjustment (range 1-20 pixels)
        strokeSlider = new JSlider(1, 20, currentStrokeWidth);
        strokeSlider.setPreferredSize(new Dimension(100, 30));
        strokeSlider.setToolTipText("Adjust stroke width for drawing and eraser");
        
        // Add change listener for real-time updates
        strokeSlider.addChangeListener(e -> {
            currentStrokeWidth = strokeSlider.getValue();
            paintPanel.setStrokeWidth(currentStrokeWidth);
            updateStrokeLabel();
        });
        
        toolBar.add(strokeSlider);
        
        // Label to show current stroke width value
        strokeLabel = new JLabel(currentStrokeWidth + "px");
        strokeLabel.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 10));
        strokeLabel.setPreferredSize(new Dimension(30, 30));
        toolBar.add(strokeLabel);
    }

    /**
     * Updates the stroke width label to reflect current value.
     * This provides immediate visual feedback to the user.
     */
    private void updateStrokeLabel() {
        strokeLabel.setText(currentStrokeWidth + "px");
    }

    private void addDrawingTools(JPanel toolBar) {
        // Create tool buttons with icons - this transforms the user experience
        JToggleButton pencil = new JToggleButton("Pencil", createToolIcon("Pencil", 16));
        pencil.setSelected(true);
        setupToolButton(pencil, "Pencil", toolBar);

        JToggleButton rectangle = new JToggleButton("Rectangle", createToolIcon("Rectangle", 16));
        setupToolButton(rectangle, "Rectangle", toolBar);
        
        JToggleButton oval = new JToggleButton("Oval", createToolIcon("Oval", 16));
        setupToolButton(oval, "Oval", toolBar);

        // Clear button with a distinctive appearance
        JButton clear = new JButton("Clear");
        clear.addActionListener(e -> paintPanel.clearAll());
        clear.setBackground(new Color(255, 200, 200));
        clear.setToolTipText("Clear the entire canvas");
        toolBar.add(clear);

        JToggleButton eraser = new JToggleButton("Eraser", createToolIcon("Eraser", 16));
        setupToolButton(eraser, "Eraser", toolBar);
        
        JToggleButton fill = new JToggleButton("Fill", createToolIcon("Fill", 16));
        setupToolButton(fill, "Fill", toolBar);
    }

    private void setupToolButton(JToggleButton button, String toolName, JPanel toolBar) {
        button.addActionListener(e -> {
            currentTool = toolName;
            paintPanel.setCurrentTool(toolName);
        });
        button.setPreferredSize(new Dimension(90, 35));  // Slightly larger for icons
        button.setHorizontalTextPosition(SwingConstants.RIGHT);  // Text to right of icon
        button.setIconTextGap(5);  // Space between icon and text
        toolGroup.add(button);
        toolBar.add(button);
    }

    private void createColorIndicators(JPanel toolBar) {
        toolBar.add(new JLabel("Stroke:"));
        strokeColorPanel = new JPanel();
        strokeColorPanel.setBackground(currentColor);
        strokeColorPanel.setPreferredSize(new Dimension(50, 30));
        strokeColorPanel.setBorder(BorderFactory.createLoweredBevelBorder());
        toolBar.add(strokeColorPanel);
        
        toolBar.add(new JLabel("Fill:"));
        fillColorPanel = new JPanel();
        fillColorPanel.setBackground(currentFillColor);
        fillColorPanel.setPreferredSize(new Dimension(50, 30));
        fillColorPanel.setBorder(BorderFactory.createLoweredBevelBorder());
        toolBar.add(fillColorPanel);
    }

    private void createColorPalette(JPanel toolBar) {
        JLabel label = new JLabel("Colors (L-click: stroke, R-click: fill):");
        label.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 10));
        toolBar.add(label);

        Color[] colors = {
                Color.BLACK, Color.DARK_GRAY, Color.GRAY, Color.LIGHT_GRAY, Color.WHITE,
                Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW, Color.MAGENTA,
                Color.CYAN, Color.ORANGE, Color.PINK, new Color(128, 0, 128), new Color(139, 69, 19)
        };

        for (Color color : colors) {
            JButton btn = new JButton();
            btn.setBackground(color);
            btn.setPreferredSize(new Dimension(25, 25));
            btn.setBorder(BorderFactory.createRaisedBevelBorder());
            
            btn.addMouseListener(new MouseAdapter() {
                @Override
                public void mouseClicked(MouseEvent e) {
                    if (SwingUtilities.isLeftMouseButton(e)) {
                        currentColor = color;
                        paintPanel.setCurrentColor(currentColor);
                        updateColorIndicators();
                    } else if (SwingUtilities.isRightMouseButton(e)) {
                        currentFillColor = color;
                        paintPanel.setCurrentFillColor(currentFillColor);
                        updateColorIndicators();
                    }
                }
                
                @Override
                public void mouseEntered(MouseEvent e) {
                    btn.setBorder(BorderFactory.createLoweredBevelBorder());
                }
                
                @Override
                public void mouseExited(MouseEvent e) {
                    btn.setBorder(BorderFactory.createRaisedBevelBorder());
                }
            });
            toolBar.add(btn);
        }

        JButton custom = new JButton("...");
        custom.setPreferredSize(new Dimension(25, 25));
        custom.addActionListener(e -> showCustomColorDialog());
        toolBar.add(custom);
    }

    private void showCustomColorDialog() {
        Color newColor = JColorChooser.showDialog(this, "Choose Custom Color", currentColor);
        if (newColor != null) {
            currentColor = newColor;
            paintPanel.setCurrentColor(currentColor);
            updateColorIndicators();
        }
    }

    private void synchronizeInitialState() {
        paintPanel.setCurrentColor(currentColor);
        paintPanel.setCurrentFillColor(currentFillColor);
        paintPanel.setCurrentTool(currentTool);
        paintPanel.setStrokeWidth(currentStrokeWidth);  // New: initialize stroke width
    }

    private void setupKeyboardHandling() {
        paintPanel.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                handleKonamiCode(e.getKeyCode());
            }
        });

        paintPanel.setFocusable(true);
        paintPanel.requestFocus();

        paintPanel.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                paintPanel.requestFocus();
            }
        });
    }

    private void updateColorIndicators() {
        strokeColorPanel.setBackground(currentColor);
        fillColorPanel.setBackground(currentFillColor);
        strokeColorPanel.repaint();
        fillColorPanel.repaint();
    }

    private void handleKonamiCode(int keyCode) {
        keySequence.add(keyCode);

        if (keySequence.size() > KONAMI_CODE.size()) {
            keySequence.remove(0);
        }

        if (keySequence.size() == KONAMI_CODE.size() && keySequence.equals(KONAMI_CODE)) {
            paintPanel.drawCoolEmoji();
            keySequence.clear();
            
            SwingUtilities.invokeLater(() -> {
                JOptionPane.showMessageDialog(this, 
                    "Konami Code Activated! 😎\n\nSecret easter egg unlocked!", 
                    "Easter Egg", 
                    JOptionPane.INFORMATION_MESSAGE);
            });
        }
    }

    public static void main(String[] args) {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            // Use default LAF if system LAF fails
        }
        
        SwingUtilities.invokeLater(() -> new PaintApp());
    }
}