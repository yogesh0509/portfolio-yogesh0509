import CodeDisplay from './components/CopyCode';

export default function Home() {
  return (
    <div className="p-5">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to my Portfolio!!<hr className='border-gray-500' /> </h1>
        <p className="mb-8">
          👋 Hi there! I'm Yogesh Agrawal, a passionate developer specializing in Information Science and Engineering. This portfolio is designed to look and feel like a VS Code environment, making it intuitive for developers and tech enthusiasts. Here's a quick guide on how to navigate through my projects and learn more about me.
        </p>
        <h2 className="text-2xl font-bold mb-4">Navigation Guide <hr className='border-gray-500' /> </h2>
        <ul className="list-disc pl-6 mb-8">
          <li>🗂️ <strong>File Explorer:</strong> On the left, you'll find a sidebar that mimics the VS Code file explorer. Each file represents a different project or section of my portfolio.</li>
          <li>📁 <strong>Projects:</strong> Inside the "Projects" folder, you'll find individual files for each of my notable projects.</li>
          <li>🔖 <strong>Experience:</strong> Inside the "Experience" folder, you'll find individual files for my professional work.</li>
          <li>📄 <strong>Readme:</strong> This section provides an overview of who I am, my skills, qualifications, and a summary of my journey in tech.</li>
          <li>💻 <strong>Terminal:</strong> Use the terminal to navigate through the file explorer but using command line.</li>

        </ul>

        {/* <CodeDisplay codeString={'# commands to run the project\ncurl http://localhost:3000/TakeYourQuiz/about\ncurl http://localhost:3000/TakeYourQuiz/TechUsed\ncurl http://localhost:3000/TakeYourQuiz/link'} language="makefile" /><br /> */}

        <p className="mb-8">
          I hope you enjoy exploring my portfolio. If you have any feedback or questions, don't hesitate to reach out. Happy browsing!
        </p>
      </div>
    </div>
  );
}
