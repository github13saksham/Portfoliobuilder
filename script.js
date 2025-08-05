const form = document.getElementById("resumeForm");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");
const skillsInput = document.getElementById("skillsInput");
const skillSuggestions = document.getElementById("skillSuggestions");
const skillsContainer = document.getElementById("skillsContainer");
const profilePicInput = document.getElementById("profilePic");

let selectedSkills = [];

const skillList = [
	"HTML",
	"CSS",
	"JavaScript",
	"React",
	"Node.js",
	"MongoDB",
	"Python",
	"C++",
	"Java",
	"Git",
	"Firebase",
	"Bootstrap",
	"Tailwind CSS",
	"TypeScript",
];

// Email validation
emailInput.addEventListener("input", () => {
	const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
	emailError.textContent = isValid ? "" : "Invalid email";
});

// Skills input and chip logic
skillsInput.addEventListener("input", () => {
	const input = skillsInput.value.toLowerCase();
	skillSuggestions.innerHTML = "";
	if (!input) return;

	const matches = skillList.filter((skill) =>
		skill.toLowerCase().startsWith(input)
	);
	matches.forEach((skill) => {
		const li = document.createElement("li");
		li.textContent = skill;
		li.addEventListener("click", () => addSkill(skill));
		skillSuggestions.appendChild(li);
	});
});

document.addEventListener("click", (e) => {
	if (!skillsInput.contains(e.target)) skillSuggestions.innerHTML = "";
});

function addSkill(skill) {
	if (selectedSkills.includes(skill)) return;

	selectedSkills.push(skill);
	const chip = document.createElement("span");
	chip.className = "chip";
	chip.textContent = skill;
	skillsContainer.appendChild(chip);
	skillsInput.value = "";
	skillSuggestions.innerHTML = "";
}

function base64ToUint8Array(base64) {
	const raw = atob(base64);
	const array = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) array[i] = raw.charCodeAt(i);
	return array;
}

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const name = document.getElementById("name").value.trim();
	const email = document.getElementById("email").value.trim();
	const bio = document.getElementById("bio").value.trim();
	const education = document.getElementById("education").value.trim();
	const jobTitle = document.getElementById("jobTitle").value.trim();
	const company = document.getElementById("company").value.trim();
	const jobDuration = document.getElementById("jobDuration").value.trim();
	const internTitle = document.getElementById("internTitle").value.trim();
	const internCompany = document.getElementById("internCompany").value.trim();
	const internDuration = document.getElementById("internDuration").value.trim();
	const projectTitle = document.getElementById("projectTitle").value.trim();
	const projectDesc = document.getElementById("projectDesc").value.trim();
	const linkedin = document.getElementById("linkedin").value.trim();
	const github = document.getElementById("github").value.trim();
	const profileFile = profilePicInput.files[0];

	const { PDFDocument, StandardFonts } = PDFLib;
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([595, 842]); // A4 size
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontSize = 12;
	let y = 780;

	// Load profile picture if exists
	async function loadImageAndGenerate() {
		let img;
		if (profileFile) {
			const reader = new FileReader();
			reader.onload = async function (event) {
				const base64 = event.target.result.split(",")[1];
				const imgBytes = base64ToUint8Array(base64);
				try {
					img = await pdfDoc.embedJpg(imgBytes);
				} catch {
					img = await pdfDoc.embedPng(imgBytes);
				}

				drawResume(img);
			};
			reader.readAsDataURL(profileFile);
		} else {
			drawResume(null);
		}
	}

	async function drawResume(image) {
		// Profile image
		if (image) {
			page.drawImage(image, {
				x: 40,
				y: y - 80,
				width: 80,
				height: 80,
			});
		}

		// Name and contact
		page.drawText(name, { x: 140, y, size: 18, font });
		page.drawText(email, { x: 140, y: y - 20, size: 12, font });
		y -= 100;

		// BIO
		page.drawText("Profile Summary", { x: 50, y, size: 14, font });
		y -= 20;
		page.drawText(bio, { x: 60, y, size: fontSize, font });
		y -= 30;

		// SKILLS
		page.drawText("Skills", { x: 50, y, size: 14, font });
		y -= 20;
		selectedSkills.forEach((skill) => {
			page.drawText(`• ${skill}`, { x: 60, y, size: fontSize, font });
			y -= 15;
		});
		y -= 10;

		// EDUCATION
		page.drawText("Education", { x: 50, y, size: 14, font });
		y -= 20;
		page.drawText(education, { x: 60, y, size: fontSize, font });
		y -= 30;

		// JOB EXPERIENCE
		page.drawText("Job Experience", { x: 50, y, size: 14, font });
		y -= 20;
		page.drawText(`${jobTitle} at ${company} (${jobDuration})`, {
			x: 60,
			y,
			size: fontSize,
			font,
		});
		y -= 30;

		// INTERNSHIP
		page.drawText("Internship", { x: 50, y, size: 14, font });
		y -= 20;
		page.drawText(`${internTitle} at ${internCompany} (${internDuration})`, {
			x: 60,
			y,
			size: fontSize,
			font,
		});
		y -= 30;

		// PROJECT
		page.drawText("Project", { x: 50, y, size: 14, font });
		y -= 20;
		page.drawText(`${projectTitle}: ${projectDesc}`, {
			x: 60,
			y,
			size: fontSize,
			font,
		});
		y -= 30;

		// LINKS
		page.drawText("Links", { x: 50, y, size: 14, font });
		y -= 20;
		page.drawText(`LinkedIn: ${linkedin}`, { x: 60, y, size: fontSize, font });
		y -= 15;
		page.drawText(`GitHub: ${github}`, { x: 60, y, size: fontSize, font });

		const pdfBytes = await pdfDoc.save();
		const blob = new Blob([pdfBytes], { type: "application/pdf" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "Resume.pdf";
		link.click();
	}

	loadImageAndGenerate();
});
