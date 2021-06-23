import React, { useState, useEffect } from 'react'
import axios from 'axios'

import Constraints from "./Constraints"
import Timetable_lib from 'react-timetable-events'
import moment from 'moment';
import Switch from "react-switch";
import {
    Button,
  } from "@material-ui/core";

const Days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Timetable = ({constraints, actualTimet, setActualTimet, previousTimetable, setPreviousTimetable, displayPrevious, setDisplayPrevious}) => {
    const [displayLecture, setDisplayLecture] = useState(true);
    const [displayTutorial, setDisplayTutorial] = useState(true);
    const [displayLab, setDisplayLab] = useState(true);
    const [displayOthers, setDisplayOthers] = useState(true);

    if (!ConstrictConflict(constraints)) {
        return (
            <div>
                <h3>Timetable</h3>
                <div className="timetable control">
                    <ViewSwitches 
                        displayLecture={displayLecture}
                        setDisplayLecture={setDisplayLecture}
                        displayTutorial={displayTutorial}
                        setDisplayTutorial={setDisplayTutorial}
                        displayLab={displayLab}
                        setDisplayLab={setDisplayLab}
                        displayOthers={displayOthers}
                        setDisplayOthers={setDisplayOthers}/>
                    <GenerateAnotherButton 
                        actualTimet={actualTimet}
                        setActualTimet={setActualTimet}
                        confirmedLessons={null}
                        previousTimetable={previousTimetable}
                        setPreviousTimetable={setPreviousTimetable}/>
                    <ViewPreviousButton 
                    displayPrevious={displayPrevious}
                    setDisplayPrevious={setDisplayPrevious}/>
                    
                </div>
                <Timetable_lib/>
            </div>); //return empty timetable
    }
    const sortedConstraints = constraints.map(x => x).sort((x, y) => x.type - y.type);
    const lessonType = actualTimet.map(LessonTypes)
    const noLessonTypesOriginal = lessonType.map(mod => mod.length)
    let validLessons = [...actualTimet];

    //this double loop filters out invalid classes and also checks at every filter 
    //if it still possible to proceed
    for (var i = 0; i < sortedConstraints.length; i++) {
        const currentConstraint = sortedConstraints[i];
        validLessons = Constraints[currentConstraint.type].filterMods(currentConstraint)(validLessons)
        const noLessonTypesFiltered = validLessons.map(LessonTypes).map(x => x.length);
        for (var j = 0; j < noLessonTypesFiltered.length; j++) {
            const filteredNo = noLessonTypesFiltered[j];
            const originalNo = noLessonTypesOriginal[j];
            if (filteredNo !== originalNo) {
                window.alert("Not possible. Consider removing " +
                    Constraints[currentConstraint.type].displayCode(currentConstraint, false))
                return (
                    <div>
                <h3>Timetable</h3>
                <div className="timetable control">
                    <ViewSwitches 
                        displayLecture={displayLecture}
                        setDisplayLecture={setDisplayLecture}
                        displayTutorial={displayTutorial}
                        setDisplayTutorial={setDisplayTutorial}
                        displayLab={displayLab}
                        setDisplayLab={setDisplayLab}
                        displayOthers={displayOthers}
                        setDisplayOthers={setDisplayOthers}/>
                    <GenerateAnotherButton 
                        actualTimet={actualTimet}
                        setActualTimet={setActualTimet}
                        confirmedLessons={confirmedLessons}
                        previousTimetable={previousTimetable}
                        setPreviousTimetable={setPreviousTimetable}/>
                    <ViewPreviousButton 
                    displayPrevious={displayPrevious}
                    setDisplayPrevious={setDisplayPrevious}/>
                </div>
                <Timetable_lib/>
            </div>
                );
            }
        }
    }

    let Timetable = new Array(5).fill(0).map(() => new Array(28).fill(null)); // a 5 x 28 array for each weekday and from 7am to 9pm
    const confirmedLessons = GeneratePossible(Timetable, validLessons, lessonType, [])
    if (confirmedLessons === null) {
        window.alert("Not possible to generate timetable due to clashes")
        return (
            <div>
                <h3>Timetable</h3>
                <div className="timetable control">
                    <ViewSwitches 
                        displayLecture={displayLecture}
                        setDisplayLecture={setDisplayLecture}
                        displayTutorial={displayTutorial}
                        setDisplayTutorial={setDisplayTutorial}
                        displayLab={displayLab}
                        setDisplayLab={setDisplayLab}
                        displayOthers={displayOthers}
                        setDisplayOthers={setDisplayOthers}/>
                    <GenerateAnotherButton 
                        actualTimet={actualTimet}
                        setActualTimet={setActualTimet}
                        confirmedLessons={confirmedLessons}
                        previousTimetable={previousTimetable}
                        setPreviousTimetable={setPreviousTimetable}/>
                    <ViewPreviousButton 
                    displayPrevious={displayPrevious}
                    setDisplayPrevious={setDisplayPrevious}/>
                </div>
                <Timetable_lib/>
            </div>
        );
    }

    return TimetableGenerator(confirmedLessons, 
        displayLecture, setDisplayLecture, 
        displayTutorial, setDisplayTutorial, 
        displayLab, setDisplayLab, 
        displayOthers, setDisplayOthers, 
        actualTimet, setActualTimet, 
        previousTimetable, setPreviousTimetable, 
        displayPrevious, setDisplayPrevious);
}

const GenerateAnotherButton = ({actualTimet, setActualTimet, confirmedLessons, previousTimetable, setPreviousTimetable}) => {
    return (
        <Button 
            variant="contained"
            onClick={() => {
                reshuffle(actualTimet, setActualTimet);  
                if (confirmedLessons !== null) {
                    setPreviousTimetable([...previousTimetable, confirmedLessons])
                }
            }}>
            Generate another
        </Button>
    );
}

const reshuffle = (actualTimet, setActualTimet) => {
    const copyTimetable = JSON.parse(JSON.stringify(actualTimet));
    const mapped = copyTimetable.map(x => {
      const shuffled = shuffleArray(x.lessons);
      return ({
        moduleCode: x.moduleCode,
        lessons: shuffled
      });
    })
    shuffleArray(mapped);
    setActualTimet(mapped);
  };

  const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array
  }

const ViewPreviousButton = ({displayPrevious, setDisplayPrevious}) => {
    return (
        <span className="view previous timetable switch">
            <label>
            <span>See previous timetables</span>
            <Switch
                checked={displayPrevious}
                onChange={setDisplayPrevious}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
                className="react-switch"
            />
            </label>
        </span>
    );
}
const ViewSwitches = ({displayLecture, setDisplayLecture, 
    displayTutorial, setDisplayTutorial, 
    displayLab, setDisplayLab, 
    displayOthers, setDisplayOthers}) => {
    return (
        <span className="view switches">
        <label>
            <span>View lectures</span>
            <Switch
                checked={displayLecture}
                onChange={setDisplayLecture}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
                className="react-switch"
                id="material-switch"
            />
        </label>
        <label>
            <span>View tutorials</span>
            <Switch
                checked={displayTutorial}
                onChange={setDisplayTutorial}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
                className="react-switch"
                id="material-switch"
            />
        </label>
        <label>
            <span>View labs</span>
            <Switch
                checked={displayLab}
                onChange={setDisplayLab}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
                className="react-switch"
                id="material-switch"
            />
        </label>
        <label>
            <span>View others</span>
            <Switch
                checked={displayOthers}
                onChange={setDisplayOthers}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
                className="react-switch"
                id="material-switch"
            />
        </label>
    </span>
    );
}

const TimetableGenerator = (confirmedLessons, 
    displayLecture, setDisplayLecture, 
    displayTutorial, setDisplayTutorial, 
    displayLab, setDisplayLab, 
    displayOthers, setDisplayOthers,
    actualTimet, setActualTimet, 
    previousTimetable, setPreviousTimetable, 
    displayPrevious, setDisplayPrevious
    ) => {
    let events = {
        monday: [], 
        tuesday: [], 
        wednesday: [], 
        thursday: [], 
        friday: []
    }
    let currentId = 1
    for (let i = 0; i < confirmedLessons.length; i++) {
        const currentLesson = confirmedLessons[i];
        if (!displayLecture && currentLesson.lesson.lessonType === "Lecture") {
            continue;
        }
        if (!displayTutorial && currentLesson.lesson.lessonType === "Tutorial") {
            continue;
        }
        if (!displayLab && currentLesson.lesson.lessonType === "Lab") {
            continue;
        }
        if (!displayOthers && (
            currentLesson.lesson.lessonType !== "Lecture" && 
            currentLesson.lesson.lessonType !== "Tutorial" && 
            currentLesson.lesson.lessonType !== "Laboratory")) {
            continue;
        }
        const newEvent = {
            id: currentId, 
            name: currentLesson.moduleCode + " " + 
                currentLesson.lesson.classNo + " " + currentLesson.lesson.lessonType + 
                " " + currentLesson.lesson.venue,
            type: currentLesson.lesson.lessonType, 
            startTime: moment(currentLesson.lesson.startTime.substring(0, 2) + ":" + 
                currentLesson.lesson.startTime.substring(2, 4), 'HH:mm'), 
            endTime: moment(currentLesson.lesson.endTime.substring(0, 2) + ":" + 
                currentLesson.lesson.endTime.substring(2, 4), 'HH:mm')
        }
        switch (Days.findIndex(x => x === currentLesson.lesson.day)) {
            case 0: 
                events = {
                    ...events, monday: [...events.monday, newEvent]
                }
            break; 
            case 1: 
                events = {
                    ...events, tuesday: [...events.tuesday, newEvent]
                }
            break;
            case 2: 
                events = {
                    ...events, wednesday: [...events.wednesday, newEvent]
                }
            break;
            case 3: 
                events = {
                    ...events, thursday: [...events.thursday, newEvent]
                }
            break;
            case 4: 
                events = {
                    ...events, friday: [...events.friday, newEvent]
                }
        }
    }

    return (
        <div>
            <h3>Timetable</h3>
                <ViewSwitches 
                    displayLecture={displayLecture}
                    setDisplayLecture={setDisplayLecture}
                    displayTutorial={displayTutorial}
                    setDisplayTutorial={setDisplayTutorial}
                    displayLab={displayLab}
                    setDisplayLab={setDisplayLab}
                    displayOthers={displayOthers}
                    setDisplayOthers={setDisplayOthers}/>
                <GenerateAnotherButton 
                    actualTimet={actualTimet}
                    setActualTimet={setActualTimet}
                    confirmedLessons={events}
                    previousTimetable={previousTimetable}
                    setPreviousTimetable={setPreviousTimetable}/>
                    <ViewPreviousButton 
                    displayPrevious={displayPrevious}
                    setDisplayPrevious={setDisplayPrevious}/>
                <Timetable_lib events={events}/>
                
            </div>
    );
}

//this function generates a possible timetable
function GeneratePossible(Timetable, validLessons, lessonType, confirmedLesson) {
    //When all lessonTypes are done and lesson type is an empty arr
    if (lessonType.map(x => x.length).reduce((x, y) => x + y, 0) === 0) {
        return confirmedLesson;
    }

    //when there are no valid lessons left
    if (validLessons.map(x => x.length).reduce((x, y) => x + y, 0) === 0) {
        return null;
    }
    const firstIndex = lessonType.map(x => x.length).findIndex(x => x !== 0);
    const firstMod = validLessons[firstIndex]; //this is the first mod in which there is still unconfirmed lesson types
    const firstLessonTypes = lessonType[firstIndex];
    const firstLessonT = firstLessonTypes[0];
    const lessonsOfMod = firstMod.lessons;
    const lessonOfThatType = lessonsOfMod.filter(x => x.lessonType === firstLessonT);
    const classNoOfThatType = lessonOfThatType.map(x => x.classNo).filter((item, i, ar) => ar.indexOf(item) === i);
    let store = [];
    for (let i = 0; i < classNoOfThatType.length; i++) {
        const copyTimetable = JSON.parse(JSON.stringify(Timetable))
        const classNo = classNoOfThatType[i];
        const classOfClassNo = lessonOfThatType.filter(x => x.classNo === classNo);
        if (!(classOfClassNo.reduce((x, y) => AddClass(y, copyTimetable, firstMod.moduleCode) && x, true))) {
            continue;
        };

        const removeConfirmed = firstMod.lessons.filter(x => x.classNo !== classNo);

        const copyLessonType = JSON.parse(JSON.stringify(lessonType))
        const copyFirstLessonTypes = firstLessonTypes.map(x => x);
        const removeLessonT = copyFirstLessonTypes.filter(x => x !== firstLessonT);
        copyLessonType.splice(firstIndex, 1, removeLessonT);

        let firstSlice = validLessons.slice(0, firstIndex)
        let secondSlice = validLessons.slice(firstIndex + 1, validLessons.length)
        for (let k = 0; k < classOfClassNo.length; k++) {
            const dummyConstraint = {
                id: null,
                type: 3,
                time: [classOfClassNo[k].day, classOfClassNo[k].startTime, classOfClassNo[k].endTime]
            }
            firstSlice = Constraints[3].filterMods(dummyConstraint)(firstSlice)
            secondSlice = Constraints[3].filterMods(dummyConstraint)(secondSlice)
        }
        const newValidLesson = [...firstSlice, {
            moduleCode: firstMod.moduleCode, 
            lessons: removeConfirmed
        }
            , ...secondSlice]

        store = [...store, {
            timetable: copyTimetable, 
            validLessons: newValidLesson, 
            lessonType: removeLessonT
        }]

        const copyConfirmedLesson = JSON.parse(JSON.stringify(confirmedLesson))
        const allLessonsToPush = firstMod.lessons.filter(x => x.classNo === classNo);
        for (let i = 0; i < allLessonsToPush.length; i++) {
            copyConfirmedLesson.push({moduleCode: firstMod.moduleCode, lesson: allLessonsToPush[i]})
        }
        const Possible = GeneratePossible(copyTimetable, newValidLesson, 
            copyLessonType, copyConfirmedLesson);
        if (Possible !== null) {
            return Possible;
        }
    }
    return null;
}

//This function is to generate a array of lesson types for this mod
const LessonTypes = mod => mod.lessons.
    map(lesson => lesson.lessonType).filter((item, i, ar) => ar.indexOf(item) === i)


//this function is to add the lesson into the timetable if there is space
//return true if there is space else return false
const AddClass = (Lesson, Timetable, moduleCode) => {
    const arrIndex = TimetableIndex(Lesson);
    const newTimetable = [...Timetable];
    const row = Timetable[arrIndex[0]];
    for (let i = arrIndex[1]; i <= arrIndex[2]; i++) {
        if (row[i] === null) {
            newTimetable[arrIndex[0]][i] = {
                moduleCode: moduleCode, 
                lesson: Lesson
            } 
        } else {
            return false;
        }
    }
    Timetable = [...newTimetable]
    return true;
}    

//This function is to generate the index of where this lesson should be in the timetable
const TimetableIndex = (Lesson) => {
    const dayIndex = Days.findIndex(eachDay => eachDay === Lesson.day);
    const sTimeHr = Math.floor((parseInt(Lesson.startTime) - 700) / 100) * 2;
    const sTimeMin = Math.floor((parseInt(Lesson.startTime) % 100) / 30);
    const eTimeHr = Math.floor((parseInt(Lesson.endTime) - 700) / 100) * 2;
    const eTimeMin = Math.ceil((parseInt(Lesson.endTime) % 100) / 30);
    return [dayIndex, sTimeHr + sTimeMin, eTimeHr + eTimeMin - 1];
}

//Checks if there are direct conflicts between constraints eg. Fix a class on Monday and No lessons on Monday
const ConstrictConflict = (constraints) => {
    //Check for conflict between FixClass and No lessons on 
    const FixClassConstraints = constraints.filter(constraint => constraint.type === 0);
    const NoLessonsOnDay = constraints.filter(constraint => constraint.type === 2);
    const NoLessonsBefore = constraints.filter(constraint => constraint.type === 1);
    const NoLessonsFrom = constraints.filter(constraint => constraint.type === 3);
    for (let i = 0; i < FixClassConstraints.length; i++) {
        const CurrentFixClassConstraints = FixClassConstraints[i];
        const startTime = parseInt(CurrentFixClassConstraints.time.split(" ")[4]);
        const endTime = parseInt(CurrentFixClassConstraints.time.split(' ')[6]);
        const day = CurrentFixClassConstraints.time.split(' ')[2];
        for (let j = i + 1; j < FixClassConstraints.length; j++) {
            const otherFixClass = FixClassConstraints[j];
            const otherSTime = parseInt(otherFixClass.time.split(" ")[4]);
            const otherETime = parseInt(otherFixClass.time.split(' ')[6]);
            const otherDay = otherFixClass.time.split(' ')[2];
            if (otherDay === day && ((otherSTime < endTime && otherSTime >= startTime) || (otherETime <= endTime && otherETime > startTime))) {
                Alert(otherFixClass, CurrentFixClassConstraints);
                return false;
            } else {continue;}
        }
        for (let j = 0; j < NoLessonsOnDay.length; j++) {
            if (NoLessonsOnDay[j].time === day) {
                Alert(NoLessonsOnDay[j], CurrentFixClassConstraints);
                return false;
            } else {continue;}
        }
        for (let j = 0; j < NoLessonsBefore.length; j++) {
            const time = parseInt(NoLessonsBefore[j].time)
            if (time > startTime) {
                Alert(NoLessonsBefore[j], CurrentFixClassConstraints);
                return false;
            } else { continue;}
        }
        for (let j = 0; j < NoLessonsFrom.length; j++) {
            const cDay = NoLessonsFrom[j].time[0]
            const sTime = parseInt(NoLessonsFrom[j].time[1])
            const eTime = parseInt(NoLessonsFrom[j].time[2])
            if (cDay === day && ((startTime >= sTime && startTime <= eTime) || (endTime >= sTime && endTime <= eTime))) {
                Alert(NoLessonsFrom[j], CurrentFixClassConstraints);
                return false;
            } else {
                continue;   
            }
        }
    }

    //checks if there is conflict between maximise online class and offline classes
    const type6 = constraints.findIndex(x => x.type === 6);
    const type7 = constraints.findIndex(x => x.type === 7)
    if (type6 !== -1 &&  type7 !== -1) {
        Alert(constraints[type6], constraints[type7]);;
        return false;
    }
    return true;
}

//To alert users if there is a direct conflict between constraints
const Alert = (constraint1, constraint2) => {
    const displayCode1 = Constraints[constraint1.type].displayCode(constraint1, false);
    window.alert("Clash between " + displayCode1 +
        " and " + Constraints[constraint2.type].displayCode(constraint2, false));
}

export default Timetable