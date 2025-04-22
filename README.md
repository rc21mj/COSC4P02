<p align="center">
  <img src="PostPioneer.png" alt="Post Pioneer" width="110">
</p>

<h1 align="center">Post Pioneer</h1>

## COSC 4P02 Team Project

This is a group project for the COSC 4P02 Software Engineering class, taught by Professor Naser Ezzati-Jivan at Brock University.

View our project documents here: [Documents](./Documents)

## Project Description 📝

The project is a SaaS web app that enables users to create social media posts by leveraging AI to aggregate relevant content and generate summarized scripts, audio, and videos. The content is automatically posted to various social media applications through platform APIs, and the bots performance can be visualized within the app.

## Team Members 🌟

| Name                                              | Student Number |
| ------------------------------------------------- | -------------- |
| Will Yochim - Product Owner, Developer            | 7630924        |
| Mohammed Shihab Khateeb - Scrum Master, Developer | 6867691        |
| Nadine Hoda - Developer                           | 7597545        |
| Ritika Chaudhary - Developer                      | 7392459        |
| Karan Arora - Developer                           | 6226120        |
| Charmvir Grewal - Developer                       | 7026057        |

## Instructions To Run
- Install Ollama
- 'pip install ollama'
- 'pip install diffusers'
- 'pip install torch'
- 'pip install transformers'
- 'ollama serve'
- Install DeepSeek (currently using 1.5b)
  - Before your first run use the command: `ollama run deepseek-r1:1.5b`
  - For other versions change the postfix in the commandline (currently 1.5b) and change the model field to that model in Save.py
  - For running timyllama, use command 'ollama run tinyllama'
- To run the front end, open your command line and navigate to `PostPioneer/frontend`
  - Have `npm` installed
  - Run `npm install react-scripts` and `npm install firebaseui`
  - Run `npm start`
- To run the back end, open your command line and navigate to `PostPioneer/4p02 testing/postpioneer`
  - Have `Python` and `pip` installed
  - Run `pip install firebase-admin`, and `pip install ollama`
  - Run `py mergedApp.py`

## License

This project is licensed under the GNU General Public License v3.0 - see [License](./LICENSE) for information.
