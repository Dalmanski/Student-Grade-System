function showSection(sectionId) {

    // Selection of higlight at the left
    var sections = document.querySelectorAll("section");
    var links = document.querySelectorAll("nav a");

    links.forEach(function(link) {
        link.addEventListener("click", function() {
            showSection(link.dataset.section);
        });
    });

    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });

    links.forEach(function(link) {
        link.classList.remove("active");
    });
    document.querySelector(`nav a[data-section="${sectionId}"]`).classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
    showContent1();
    loadAllStudentProfiles();
    updateStudentList();

    document.getElementById("clearLocalStorageBtn").addEventListener("click", function() {
        if (confirm("Are you sure you want to delete all data stored in localStorage?")) {
            localStorage.clear();
            alert("Local storage cleared successfully!");
            loadAllStudentProfiles();
            updateStudentList();
            clearTable();
        }
    });

    // Function to display contents of localStorage
    function displayLocalStorageContents() {
        console.log("Contents of localStorage:");
        var localStorageContents = document.getElementById("localStorageContents");
        localStorageContents.innerHTML = ''; // Clear previous contents

        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            var value = localStorage.getItem(key);
            console.log(key + ": " + value);

            var content = document.createElement('div');
            content.textContent = key + ": " + value;
            localStorageContents.appendChild(content);
        }
    }

    // Get references to the button and the container
    var showDataButton = document.getElementById("showData");
    var localStorageData = document.getElementById("localStorageData");

    // Add event listener to the button
    showDataButton.addEventListener("click", function() {
        if (localStorageData.style.display === "none") {
            localStorageData.style.display = "block";
            displayLocalStorageContents(); // Update the display when showing the data
        } else {
            localStorageData.style.display = "none";
        }
    });
    
    // Show the home section by default
    showSection("home");
});

function showContent1() {
    document.getElementById('content1').style.display = 'block';
    document.getElementById('content2').style.display = 'none';
}

function showContent2(section) {
    document.getElementById('content1').style.display = 'none';
    document.getElementById('content2').style.display = 'block';
    
    showSection(section);
}


function addNewStudent() {
    var newStudentNameInput = document.getElementById("newStudentName");
    var newStudentName = newStudentNameInput.value.trim();

    if (newStudentName === "") {
        alert("Please enter a valid student name.");
        return;
    }

    // Check if the student name already exists
    var studentNameSelect = document.getElementById("studentNameSelect");
    for (var i = 0; i < studentNameSelect.options.length; i++) {
        if (studentNameSelect.options[i].value === newStudentName) {
            alert("Student name already exists.");
            return;
        }
    }

    // Add the new student to the dropdown
    var newOption = document.createElement("option");
    newOption.value = newStudentName;
    newOption.textContent = newStudentName;
    studentNameSelect.appendChild(newOption);

    studentNameSelect.value = newStudentName; // Select the newly added student
    newStudentNameInput.value = ""; // Clear the new student name input

    clearTable();
    saveGrades();
    loadAllStudentProfiles();
    updateStudentList();

    alert("Student " + newStudentName + " is now added");
}

// Change light and dark mode
function toggleMode() {
    var element = document.body;
    element.classList.toggle("light-mode");
    element.classList.toggle("dark-mode");
    loadAllStudentProfiles();
    updateStudentList();
    updateEmptyMessage();
    saveGrades();
}

function calculateGWA() {
    var table = document.getElementById("gradesTable");
    var rowCount = table.rows.length;
    var calculateGradeXUnit = 0;
    var totalUnit = 0;

    for (var i = 1; i < rowCount; i++) {
        var grade = parseFloat(table.rows[i].cells[2].getElementsByTagName('input')[0].value);
        var unit = parseFloat(table.rows[i].cells[3].getElementsByTagName('input')[0].value);

        if (!isNaN(grade) && !isNaN(unit)) {
            totalUnit += unit;
            calculateGradeXUnit += (grade * unit);
        }
    }

    var GWA = calculateGradeXUnit / totalUnit;
    if (!isNaN(GWA)) {
        document.getElementById("result").innerHTML = "Your General Weighted Average (GWA) is: " + GWA.toFixed(2);
    } else {
        document.getElementById("result").innerHTML = "Please enter valid grades and units.";
    }
    updateEmptyMessage();
}

function loadAllStudentProfiles() {
    var studentDetailsSection = document.getElementById("student-details");
    
    studentDetailsSection.innerHTML = ""; // Clear any existing content

    // Get all student names from localStorage
    var studentNames = Object.keys(localStorage).filter(key => !key.endsWith('_profile'));

    studentNames.forEach(function(studentName) {
        var studentProfile = JSON.parse(localStorage.getItem(studentName + "_profile"));

        if (studentProfile) {
            // Calculate GWA for the student
            var gradesData = JSON.parse(localStorage.getItem(studentName)) || [];
            var totalUnits = 0;
            var gradeXUnits = 0;
            gradesData.forEach(function(gradeData) {
                totalUnits += parseFloat(gradeData.unit);
                gradeXUnits += parseFloat(gradeData.grade) * parseFloat(gradeData.unit);
            });
            var GWA = totalUnits ? (gradeXUnits / totalUnits) : 0;

            // Create a container for each student profile
            var studentContainer = document.createElement("div");
            studentContainer.classList.add("student-container");

            // Create and append the profile picture
            var profilePicture = document.createElement("img");
            profilePicture.src = studentProfile.picture;
            profilePicture.alt = "Profile Picture";
            profilePicture.classList.add("profile-picture");
            studentContainer.appendChild(profilePicture);

            // Create and append the student name
            var nameElement = document.createElement("p");
            nameElement.innerHTML = `<strong>Name:</strong> ${studentProfile.name}`;
            studentContainer.appendChild(nameElement);

            // Create and append the student age
            var ageElement = document.createElement("p");
            ageElement.innerHTML = `<strong>Age:</strong> ${studentProfile.age}`;
            studentContainer.appendChild(ageElement);

            // Create and append the student address
            var addressElement = document.createElement("p");
            addressElement.innerHTML = `<strong>Address:</strong> ${studentProfile.address}`;
            studentContainer.appendChild(addressElement);

            // Create and append the student gwa
            var gwaElement = document.createElement("p");
            gwaElement.innerHTML = `<strong>GWA:</strong> ${GWA.toFixed(2)}`;
            studentContainer.appendChild(gwaElement);

            // Append the student container to the student-details section
            studentDetailsSection.appendChild(studentContainer);
        }
    });
}

function addSubjectRowAtIndex(index) {
    var table = document.getElementById("gradesTable");
    var row = table.insertRow(index);
    insertRowContent(row, index);
}

function addSubjectRow() {
    var table = document.getElementById("gradesTable");
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    insertRowContent(row, rowCount);
}

function insertRowContent(row, index) {
    var cell0 = row.insertCell(0);
    var removeButton = document.createElement("button");
    removeButton.innerHTML = "&#128465;" // Icon of trash
    removeButton.onclick = function() {
        var subjectName = row.cells[1].getElementsByTagName('input')[0].value;
        if (confirm("Are you sure you want to delete " + subjectName + "?")) {
            var table = document.getElementById("gradesTable");
            table.deleteRow(row.rowIndex);
            calculateGWA();
            saveGrades();
            loadGrades();
            loadAllStudentProfiles();
        }
    };
    cell0.appendChild(removeButton);

    var addButton = document.createElement("button");
    addButton.innerHTML = "+";
    addButton.onclick = function() {
        addSubjectRowAtIndex(row.rowIndex + 1);  // Change here to add after the current row
    };
    cell0.appendChild(addButton);

    for (var i = 1; i <= 3; i++) {
        var cell = row.insertCell(i);
        var element = document.createElement("input");
        element.type = (i == 1) ? "text" : "number";
        element.step = (i == 2 || i == 3) ? "0.01" : "";
        element.name = (i == 1) ? "subject" + index : "grade" + index;
        element.placeholder = (i == 1) ? "Enter subject" : "Enter " + ((i == 2) ? "grade" : "unit");
        element.addEventListener('blur', saveGrades); // Add event listener for autosave
        element.addEventListener('keydown', handleEnterKey); // Add event listener for Enter key
        cell.appendChild(element);
    }

    updateEmptyMessage();
}

function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        var inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
        var index = Array.prototype.indexOf.call(inputs, event.target);
        if (index >= 0 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        } else if (index === inputs.length - 1) {
            addSubjectRow();
            inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
            inputs[inputs.length - 3].focus(); // Focus on the new subject input
        }
    }
    calculateGWA();
    loadAllStudentProfiles();
}

function toggleMode() {
    var element = document.body;
    element.classList.toggle("light-mode");
    element.classList.toggle("dark-mode");
    updateEmptyMessage();
    saveGrades();
}

function saveGrades() {
    var studentNameSelect = document.getElementById("studentNameSelect");
    var studentName = studentNameSelect.value;

    if (!studentName) {
        alert("Please select a student.");
        return;
    }

    var gradesData = [];
    var table = document.getElementById("gradesTable");
    var rowCount = table.rows.length;

    for (var i = 1; i < rowCount; i++) {
        var subject = table.rows[i].cells[1].getElementsByTagName('input')[0].value;
        var grade = table.rows[i].cells[2].getElementsByTagName('input')[0].value;
        var unit = table.rows[i].cells[3].getElementsByTagName('input')[0].value;

        if (subject && grade && unit) {
            gradesData.push({
                subject: subject,
                grade: grade,
                unit: unit
            });
        }
    }

    localStorage.setItem(studentName, JSON.stringify(gradesData));
}

removeButton.onclick = function() {
    table.deleteRow(row.rowIndex);
    saveGrades();
};


function loadGrades() {
    var studentNameSelect = document.getElementById("studentNameSelect");
    var studentName = studentNameSelect.value;
    if (!studentName) {
        return;
    }

    var gradesData = localStorage.getItem(studentName);
    if (!gradesData) {
        clearTable();
        return;
    }

    gradesData = JSON.parse(gradesData);
    var table = document.getElementById("gradesTable");

    clearTable();

    gradesData.forEach((gradeData, index) => {
        var row = table.insertRow(index + 1);

        var cell0 = row.insertCell(0);
        var removeButton = document.createElement("button");
        removeButton.innerHTML = "&#128465;"; //Icon of trash
        removeButton.onclick = function() {
            var subjectName = row.cells[1].getElementsByTagName('input')[0].value;
            if (confirm("Are you sure you want to delete " + subjectName + "?")) {
                var table = document.getElementById("gradesTable");
                table.deleteRow(row.rowIndex);
                saveGrades();
            }
        };
        cell0.appendChild(removeButton);

        var addButton = document.createElement("button");
        addButton.innerHTML = "+";
        addButton.onclick = function() {
            addSubjectRowAtIndex(row.rowIndex + 1);  // Change here to add after the current row
        };
        cell0.appendChild(addButton);

        var cell1 = row.insertCell(1);
        var element1 = document.createElement("input");
        element1.type = "text";
        element1.name = "subject" + (index + 1);
        element1.value = gradeData.subject;
        element1.oninput = calculateGWA;
        element1.addEventListener('keydown', handleEnterKey);
        cell1.appendChild(element1);

        var cell2 = row.insertCell(2);
        var element2 = document.createElement("input");
        element2.type = "number";
        element2.step = "0.01";
        element2.name = "grade" + (index + 1);
        element2.value = gradeData.grade;
        element2.oninput = calculateGWA;
        element2.addEventListener('keydown', handleEnterKey);
        cell2.appendChild(element2);

        var cell3 = row.insertCell(3);
        var element3 = document.createElement("input");
        element3.type = "number";
        element3.step = "0.01";
        element3.name = "unit" + (index + 1);
        element3.value = gradeData.unit;
        element3.oninput = calculateGWA;
        element3.addEventListener('keydown', handleEnterKey);
        cell3.appendChild(element3);
    });
    calculateGWA();
    loadAllStudentProfiles();
    updateEmptyMessage();
}

function handleStudentNameChange() {
    loadGrades();
    updateEmptyMessage();
}

function updateStudentList() {
    var studentNameSelect = document.getElementById("studentNameSelect");
    var studentNames = Object.keys(localStorage);

    studentNameSelect.innerHTML = ""; // Clear existing options

    // Filter out keys that end with '_profile'
    var filteredStudentNames = studentNames.filter(function(name) {
        return !name.endsWith("_profile");
    });

    studentNames.forEach(function(name) {
        if (!name.endsWith("_profile")) {
            var option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            studentNameSelect.appendChild(option);
        }
    });

    loadGrades();
}


function deleteStudent() {
    var studentNameSelect = document.getElementById("studentNameSelect");
    var studentName = studentNameSelect.value;
    if (!studentName) {
        alert("Please select a student to delete.");
        return;
    }

    if (confirm("Are you sure you want to delete the student '" + studentName + "'?")) {
        localStorage.removeItem(studentName);
        localStorage.removeItem(studentName + "_profile");
        loadAllStudentProfiles();
        updateStudentList();
        clearTable();
    }
}

function clearTable() {
    var table = document.getElementById("gradesTable");
    var rowCount = table.rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }
    document.getElementById("result").innerHTML = "";
    updateEmptyMessage();
}

function updateEmptyMessage() {
    var table = document.getElementById("gradesTable");
    var emptyMessage = document.querySelector(".empty-message");

    if (table.rows.length <= 1) {
        // Table is empty or has only header row
        if (!emptyMessage) {
            emptyMessage = document.createElement("p");
            emptyMessage.innerHTML = "Add new subject";
            emptyMessage.classList.add("empty-message");
            table.parentNode.insertBefore(emptyMessage, table.nextSibling);
        }
    } else {
        // Table has subjects, remove empty message if exists
        if (emptyMessage) {
            emptyMessage.parentNode.removeChild(emptyMessage);
        }
    }
}


function handleProfilePictureUpload() {
    var fileInput = document.getElementById("profile-picture-upload");
    var file = fileInput.files[0];

    var reader = new FileReader();
    reader.onload = function(event) {
        var profilePicture = event.target.result;
        var studentName = document.getElementById("newStudentName").value.trim();

        if (profilePicture && studentName) {
            var studentProfile = {
                picture: profilePicture,
                name: studentName,
                age: document.getElementById("studentAge").value,
                address: document.getElementById("studentAddress").value
            };

            localStorage.setItem(studentName + "_profile", JSON.stringify(studentProfile));
            loadAllStudentProfiles(); // Update the student details section
        }
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

// Add event listener for profile picture upload
document.getElementById("profile-picture-upload").addEventListener("change", handleProfilePictureUpload);

window.onload = function() {
    updateStudentList();
    document.getElementById("studentNameSelect").onchange = handleStudentNameChange;
    document.getElementById("deleteStudentBtn").onclick = deleteStudent;
    document.getElementById("addStudentBtn").onclick = addNewStudent;
    updateEmptyMessage();
    loadGrades();
};