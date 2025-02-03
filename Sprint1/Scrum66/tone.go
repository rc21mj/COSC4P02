package main

import (
	"fmt"
	"os/exec"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	// Route to render the input form
	app.Get("/", func(c *fiber.Ctx) error {
		c.Type("html", "utf-8") // Set content type to HTML
		form := `
			<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preferences</title>
</head>
<body style="font-family: Courier, monospace; background-color: #ebf1f2; margin: 0; padding: 20px;">
    
    <!-- Header -->
    <h1 style="text-align: center; color: #333; font-size: 2.5em; margin-bottom: 20px;">Choose Your Preferences</h1>

    <!-- Form Container -->
    <form style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" action="submit" method="post">
        
        <!-- Tone Selection Dropdown -->
        <label for="tone" style="display: block; margin-bottom: 10px; font-weight: bold; color: #555;">Select Tone:</label>
        <select id="tone" name="tone" style="width: 100%; padding: 10px; font-size: 1em; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 20px;">
            <option value="formal">Formal</option>
            <option value="educational">Educational</option>
            <option value="comedic">Comedic</option>
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
        </select>

        <!-- Schedule Selection Dropdown -->
        <label for="schedule" style="display: block; margin-bottom: 10px; font-weight: bold; color: #555;">Select Schedule:</label>
        <select id="schedule" name="schedule" style="width: 100%; padding: 10px; font-size: 1em; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 20px;">
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="biweekly">Biweekly</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
        </select>

        <!-- Topic Input Section -->
        <label for="topic" style="display: block; margin-bottom: 10px; font-weight: bold; color: #555;">Enter Your Topic:</label>
        <input type="text" id="topic" name="topic" placeholder="Type your topic here..." style="width: 100%; padding: 10px; font-size: 1em; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 20px;">

        <!-- Submit Button -->
        <button type="submit" style="display: block; width: 100%; padding: 10px; font-size: 1em; background-color: #007BFF; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Submit Preferences
        </button>

    </form>

</body>
</html>
		`
		return c.SendString(form)
	})

	// Route to handle form submission
	app.Post("/submit", func(c *fiber.Ctx) error {
		tone := c.FormValue("tone")
		topic := c.FormValue("topic")
		schedule := c.FormValue("schedule")

		// Call save.py with arguments
		cmd := exec.Command("python3", "Save.py", tone, topic, schedule)
		err := cmd.Run()
		if err != nil {
			fmt.Println("Error running Python script:", err)
			return c.Status(500).SendString("Failed to save data")
		}

		response := fmt.Sprintf("Saved: Tone=%s, Topic=%s, Schedule=%s", tone, topic, schedule)
		return c.SendString(response)
	})

	app.Listen(":3000")
}
