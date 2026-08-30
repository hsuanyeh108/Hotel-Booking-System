# Hotel-Booking-System
IFN636 Assessment 1 - Hotel Room Booking System

## Deployment URL:
- **Live Demo URL:** `http://3.27.202.251:3000`
- **EC2 Instance Name/ID:** Sarah / i-02aa2b3e349ed3332
- **Tagged Release:** `v1.0.0`

## Architecture Summary:
This application is a web application designed for hotel reservation and hotel admin management. It follows a client-server architecture with cloud deployment on AWS EC2:

- **Frontend:** Built with HTML/CSS/JavaScript, providing user interfaces for both Guests (booking rooms) and Administrators (managing bookings and room types).
- **Backend:** Developed using Node.js and Express.js, providing APIs to handle core logic, user authentication, and booking histories.
- **Database:** MongoDB (Cloud Database), managed through Mongoose for structured data handling and persistent storage.
- **Cloud Infrastructure:** Hosted on AWS EC2 (Ubuntu Environment) with security group configurations allowing HTTP and SSH traffic.

## Environment Setup and Installation:
- **Node.js:** v18.x or higher.
- **npm:** v9.x or higher.
- **MongoDB:** Cloud MongoDB Atlas connection string.
- **GitHub:** Clone the repository, git clone git clone [https://github.com/](https://github.com/)hsuanyeh108/Hotel-Booking-System.git, and cd back to the project : cd Hotel-Booking-System.

## Install Dependencies:
- **Install Backend:** cd backend ; npm install.
- **Install Frontend:** cd../frontend ; npm install.

## Create an .env file inside backend/ and add following configuration:PORT=3000
- **.env:**PORT=3000 ; NODE_ENV=production ; mongodb+srv://Sarah:sarah1228@cluster0.9ryf5k0.mongodb.net/HotelBookingSystem?appName=Cluster0.

## Run Application:
- **Start Backend Server:** cd backend ; npm start.
- **Start Frontend Server:** cd frontend ; npm start.

## Deployment to AWS EC2:
- **EC2 setting:** Ubuntu Linux launched with SSH(Port22) and HTTP(Port 3000 and 5001)in Security Group.
- **EC2 environment:** Installed Node.js, npm, and Git on the EC2 instance.
- **Application setup:** Cloned the project repository onto EC2, and created the remote .env configuration file safely on the server.
- **Execution of progress:** Using Node.js / PM2 for background process execution, and started the express server.

## Known Limitations:
- **Gateway of payment system:** Not using the real third-party payment integration, such as PayPal, ApplePay.
- **Automated CI/CD:** Automated CI/CD is out of scope for this step, manual deployment process used for EC2 updates.
