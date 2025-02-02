package main

import (
	"fmt"
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
		response1 := fmt.Sprintf("You selected the tone: %s", tone)
		topic := c.FormValue("topic")
		response2 := fmt.Sprintf("You selected the topic: %s", topic)
		schedule := c.FormValue("schedule")
		response3 := fmt.Sprintf("You selected the schedule: %s", schedule)
		response := fmt.Sprintf("%s\n%s\n%s", response1, response2, response3)
		return c.SendString(response)
	})

	app.Listen(":3000")
}