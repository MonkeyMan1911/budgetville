import { player } from "../objects/player";
import Mission from "../systems/Mission";

class PauseMenu {
    private menuElement: HTMLDivElement;
    private tabsElement: HTMLDivElement;
    private missionsSideBarElement: HTMLDivElement;
    private currentTab: string = "";
    private selectedMission: Mission | null = null;

    constructor() {
        this.menuElement = document.getElementById("pause-menu") as HTMLDivElement
        this.tabsElement = document.getElementById("pause-menu-tabs") as HTMLDivElement
        this.missionsSideBarElement = document.getElementById("missions-sidebar") as HTMLDivElement

        Array.from(this.tabsElement.children).forEach(tab => {
            tab.addEventListener("click", () => {
                Array.from(this.tabsElement.children).forEach(t => {
                    t.classList.remove("tab-selected")
                    t.classList.add("tab-unselected")
                })
                tab.classList.add("tab-selected")
                tab.classList.remove("tab-unselected")
                this.currentTab = tab.innerHTML.toLowerCase()
            })

            if (tab.classList.contains("tab-selected")) {
                this.currentTab = tab.innerHTML.toLowerCase()
            }
        })
    }

    // Call this after player/excalibur is ready
    init() {
        this.refreshMissions()
    }

    refreshMissions() {
        this.missionsSideBarElement.innerHTML = ""
        const activeMission = player.getCurrentMission()

        player.getMissionsArray().forEach(mission => {
            const btn = document.createElement("button")
            btn.textContent = mission.getName()

            const isActive = activeMission && mission.getName() === activeMission.getName()
            btn.classList.add(isActive ? "mission-selected" : "mission-unselected")

            if (isActive) {
                this.selectedMission = mission
                this.updateMissionInfo(mission)
                this.updateMissionButtons(mission)
            }

            btn.addEventListener("click", () => {
                Array.from(this.missionsSideBarElement.children).forEach(b => {
                    b.classList.remove("mission-selected")
                    b.classList.add("mission-unselected")
                })
                btn.classList.add("mission-selected")
                btn.classList.remove("mission-unselected")

                this.selectedMission = mission
                this.updateMissionInfo(mission)
                this.updateMissionButtons(mission)
            })

            this.missionsSideBarElement.appendChild(btn)
        })
    }

    private updateMissionInfo(mission: Mission) {
        const infoEl = document.getElementById("mission-info")!
        const isTracked = player.getCurrentMission()?.getName() === mission.getName()
        infoEl.innerHTML = `
            <p id="mission-info-name">${mission.getName()}</p>
            <p id="mission-info-desc">${mission.getDescription()}</p>
            <p id="mission-info-objs">Status: ${isTracked ? "Tracking" : "Untracked"}</p>
        `
    }

    private updateMissionButtons(mission: Mission) {
        const actionsEl = document.getElementById("mission-actions")!
        const isTracked = player.getCurrentMission()?.getName() === mission.getName()

        actionsEl.innerHTML = `
            <button id="track-mission" ${isTracked ? "disabled" : ""}>Track</button>
            <button id="untrack-mission" ${!isTracked ? "disabled" : ""}>Untrack</button>   
        `

        document.getElementById("track-mission")!.addEventListener("click", () => {
            player.trackMission(mission.getName())
            this.updateMissionButtons(mission)
            this.updateMissionInfo(mission)
        })

        document.getElementById("untrack-mission")!.addEventListener("click", () => {
            player.untrackMission()
            this.updateMissionButtons(mission)
            this.updateMissionInfo(mission)
        })
    }

    show() {
        this.refreshMissions() // always up to date when opened
        this.menuElement.classList.remove("hide")
        this.menuElement.classList.add("show")
    }

    hide() {
        this.menuElement.classList.remove("show")
        this.menuElement.classList.add("hide")
    }
}

export const pauseMenu = new PauseMenu()