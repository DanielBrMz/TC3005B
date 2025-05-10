import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class PaintApp extends JFrame {
    private PaintPanel paintPanel;
    private Color currentColor = Color.BLACK;
    private String currentTool = "Pencil";
    private ButtonGroup toolGroup;
    
    // Konami code sequence
    private final List<Integer> KONAMI_CODE = Arrays.asList(
        KeyEvent.VK_UP, KeyEvent.VK_UP, KeyEvent.VK_DOWN, KeyEvent.VK_DOWN,
        KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT, KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT,
        KeyEvent.VK_B, KeyEvent.VK_A
    );
    private ArrayList<Integer> keySequence = new ArrayList<>();

    public PaintApp() {
        // Set up the frame
        super("Java Paint App");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(800, 600);
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

        // Create clear button (changed from Arc, now JButton instead of JToggleButton)
        JButton clearButton = new JButton("Clear");
        clearButton.addActionListener(e -> {
            paintPanel.clearAll();
        });
        // Note: Clear button is NOT added to the toolGroup since it's not a toggle button
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

        // Add colors (10 colors as required)
        Color[] colors = {
                Color.BLACK, Color.DARK_GRAY, Color.GRAY, Color.LIGHT_GRAY, Color.WHITE,
                Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW, Color.MAGENTA
        };

        for (Color color : colors) {
            JButton colorButton = new JButton();
            colorButton.setBackground(color);
            colorButton.setPreferredSize(new Dimension(30, 30));
            colorButton.addActionListener(e -> {
                currentColor = color;
                paintPanel.setCurrentColor(currentColor);
            });
            toolBar.add(colorButton);
        }

        add(toolBar, BorderLayout.NORTH);

        // Set initial values to paint panel
        paintPanel.setCurrentColor(currentColor);
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

        // Add KeyListener for Konami code
        addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                handleKonamiCode(e.getKeyCode());
            }
        });
        
        // Make sure the frame can receive key events
        setFocusable(true);
        requestFocus();

        setVisible(true);
    }

    private void handleKonamiCode(int keyCode) {
        keySequence.add(keyCode);
        
        // Keep only the last 10 keys (length of Konami code)
        if (keySequence.size() > KONAMI_CODE.size()) {
            keySequence.remove(0);
        }
        
        // Check if the sequence matches the Konami code
        if (keySequence.size() == KONAMI_CODE.size() && keySequence.equals(KONAMI_CODE)) {
            paintPanel.drawCoolEmoji();
            keySequence.clear(); // Reset the sequence
            JOptionPane.showMessageDialog(this, "Konami Code Activated! 😎", "Easter Egg", JOptionPane.INFORMATION_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new PaintApp());
    }
}