import java.sql.*;
import java.util.Random;

public class PropertyUpdater {
    public static void main(String[] args) {
        String url = "jdbc:h2:mem:testdb"; // This won't work for mem: unless we used a file-based one.
        // Given I cannot easily connect to an in-memory DB of a running Spring Boot app from a separate process,
        // I will use a different approach: creating a temporary controller or using an existing one.
    }
}
