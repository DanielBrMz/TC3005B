/**
 * Main paint application with enhanced color management and Konami code easter egg.
 * Provides professional drawing tools with temporal layering and dual-color system.
 */
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class PaintApp extends JFrame {
    private PaintPanel paintPanel;
    private Color currentColor = Color.BLACK;
    private Color currentFillColor = Color.WHITE;
    private String currentTool = "Pencil";
    private ButtonGroup toolGroup;
    
    private JPanel strokeColorPanel;
    private JPanel fillColorPanel;

    // Konami code: ↑↑↓↓←→←→BA
    private final List<Integer> KONAMI_CODE = Arrays.asList(
            KeyEvent.VK_UP, KeyEvent.VK_UP, KeyEvent.VK_DOWN, KeyEvent.VK_DOWN,
            KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT, KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT,
            KeyEvent.VK_B, KeyEvent.VK_A);
    private ArrayList<Integer> keySequence = new ArrayList<>();

    public PaintApp() {
        super("Java Paint App - Professional Edition");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1000, 700);
        setLayout(new BorderLayout());

        paintPanel = new PaintPanel();
        add(paintPanel, BorderLayout.CENTER);

        createToolbar();
        synchronizeInitialState();
        setupKeyboardHandling();

        setLocationRelativeTo(null);
        setVisible(true);
    }

    private void createToolbar() {
        JPanel toolBar = new JPanel(new FlowLayout(FlowLayout.LEFT));
        toolGroup = new ButtonGroup();

        addDrawingTools(toolBar);
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

    private void addDrawingTools(JPanel toolBar) {
        JToggleButton pencil = new JToggleButton("Pencil");
        pencil.setSelected(true);
        setupToolButton(pencil, "Pencil", toolBar);

        setupToolButton(new JToggleButton("Rectangle"), "Rectangle", toolBar);
        setupToolButton(new JToggleButton("Oval"), "Oval", toolBar);

        JButton clear = new JButton("Clear");
        clear.addActionListener(e -> paintPanel.clearAll());
        clear.setBackground(new Color(255, 200, 200));
        toolBar.add(clear);

        setupToolButton(new JToggleButton("Eraser"), "Eraser", toolBar);
        setupToolButton(new JToggleButton("Fill"), "Fill", toolBar);
    }

    private void setupToolButton(JToggleButton button, String toolName, JPanel toolBar) {
        button.addActionListener(e -> {
            currentTool = toolName;
            paintPanel.setCurrentTool(toolName);
        });
        button.setPreferredSize(new Dimension(80, 30));
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