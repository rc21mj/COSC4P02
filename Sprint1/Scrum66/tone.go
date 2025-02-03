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
			<html>
			<head>
				<title>Specify Tone</title>
			</head>
			<body>
				<h2>Enter Tone (e.g., relaxed, professional)</h2>
				<form action="/submit" method="post">
					<input type="text" name="tone" placeholder="Enter tone..." required>
				<h2>Enter Topic (e.g., relaxed, professional)</h2>
					<input type="text" name="topic" placeholder="Enter topic..." required>
				<h2>Enter Schedule (e.g., relaxed, professional)</h2>
					<input type="text" name="schedule" placeholder="Enter schedule..." required>
					<button type="submit">Submit</button>
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
		cmd := exec.Command("python3", "save.py", tone, topic, schedule)
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