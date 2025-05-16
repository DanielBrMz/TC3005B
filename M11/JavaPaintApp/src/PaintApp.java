import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class PaintApp extends JFrame {
    private PaintPanel paintPanel;
    private Color currentColor = Color.BLACK;
    private String currentTool = "Pencil";
    private ButtonGroup toolGroup;

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
        
        // Create arc button
        JToggleButton arcButton = new JToggleButton("Arc");
        arcButton.addActionListener(e -> currentTool = "Arc");
        toolGroup.add(arcButton);
        toolBar.add(arcButton);
        
        // Create eraser button
        JToggleButton eraserButton = new JToggleButton("Eraser");
        eraserButton.addActionListener(e -> currentTool = "Eraser");
        toolGroup.add(eraserButton);
        toolBar.add(eraserButton);
        
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
        arcButton.addActionListener(toolListener);
        eraserButton.addActionListener(toolListener);
        
        setVisible(true);
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new PaintApp());
    }
}