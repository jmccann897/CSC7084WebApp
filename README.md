# CSC7084WebApp
Online repo for CSC7084 - Web Development module assignment of developing an emotion tracker web app
The web app use an api to connect to a database that contains user, emotion snapshot and trigger data. 
The web app allows for user sign up and log in, presents the user with their historical data in a table. 
Users can add new snapshot data, edit the contextual trigger information and delete a snapshot record.
Users can view their data visualised in bar, radar and line charts. 
Admins can be created and can view all records of the database with permission to delete data records.

Requirements:
- Windows based machine
- IDE for running node based web app (eg VSCode)
- MySQL database software (eg XAMPP)

Initialisation of components (Database, WebApp API, WebApp)
Initialising Database
- Start XAMPP
    - Start Apache
    - Start MySQL
- If first time loading project, need to import database
- Download the SQL data file: emotiontracker_data.sql
- Open PHP MyAdmin (either through XAMPP by selecting admin tab of MySQL or entering http://localhost/phpmyadmin/ into browser)
- Create new database by selecting New on left hand side panel, typing a name and pressing the Create button, resulting in a new empty database. 
- Within the newly created database, select import and then the emotiontracker_data.sql file. Press import and the database should be updated to include the data provided in the emotiontracker_data.sql file. 

Initialising WebAppAPI
- Download CSC7084WebAppAPI zip folder and extract it
- Open a Terminal then initialize the project by typing in the command npm init --y which will result in the package.json file being created
- Start running the app with nodemon by entering the command npm start in the Terminal. If you need to stop running the app, Ctrl+C should be entered into the Terminal, subsequently followed by the letter y.

Initialising WebApp
- Download CSC7084WebApp zip folder and extract it
- Open a Terminal then initialize the project by typing in the command npm init --y which will result in the package.json file being created
- Start running the app with nodemon by entering the command npm start in the Terminal. If you need to stop running the app, Ctrl+C should be entered into the Terminal, subsequently followed by the letter y.