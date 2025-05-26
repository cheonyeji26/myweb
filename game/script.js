document.addEventListener('DOMContentLoaded', () => {
    const divideButton = document.getElementById('divideButton');
    const participantNamesTextarea = document.getElementById('participantNames');
    const nameCountStatus = document.getElementById('nameCountStatus');
    const errorMessage = document.getElementById('errorMessage');

    const teamAList = document.getElementById('teamAList');
    const teamBList = document.getElementById('teamBList');
    const teamANameEl = document.getElementById('teamAName'); // Element 참조
    const teamBNameEl = document.getElementById('teamBName'); // Element 참조

    const REQUIRED_PARTICIPANTS = 39;

    // 참가자 이름 입력 시 실시간으로 인원 수 업데이트
    participantNamesTextarea.addEventListener('input', () => {
        const names = participantNamesTextarea.value.split('\n').map(name => name.trim()).filter(name => name !== "");
        nameCountStatus.textContent = `입력된 참가자 수: ${names.length} / ${REQUIRED_PARTICIPANTS}`;
        if (names.length === REQUIRED_PARTICIPANTS) {
            nameCountStatus.style.color = 'green';
        } else {
            nameCountStatus.style.color = '#555';
        }
    });

    divideButton.addEventListener('click', () => {
        errorMessage.textContent = ''; // 이전 에러 메시지 초기화

        // 1. 참가자 명단 가져오기 및 유효성 검사
        const namesString = participantNamesTextarea.value;
        let people = namesString.split('\n') // 각 줄을 요소로 분리
                                .map(name => name.trim()) // 앞뒤 공백 제거
                                .filter(name => name !== ""); // 빈 줄 제거

        if (people.length !== REQUIRED_PARTICIPANTS) {
            errorMessage.textContent = `정확히 ${REQUIRED_PARTICIPANTS}명의 참가자 이름을 입력해야 합니다. 현재 ${people.length}명입니다.`;
            clearTeamDisplay(); // 팀 표시 초기화
            return;
        }

        // 2. 사람 목록 랜덤 섞기 (Fisher-Yates Shuffle 알고리즘)
        for (let i = people.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [people[i], people[j]] = [people[j], people[i]]; // ES6 Destructuring swap
        }

        // 3. 두 조로 나누기 (한 조는 20명, 다른 조는 19명)
        const teamASize = Math.ceil(REQUIRED_PARTICIPANTS / 2); // 20명
        // const teamBSize = Math.floor(REQUIRED_PARTICIPANTS / 2); // 19명 (people.slice(teamASize) 로 나머지 자동 할당)

        let teamA = people.slice(0, teamASize);
        let teamB = people.slice(teamASize);

        // 4. 화면에 결과 표시
        displayTeams(teamA, teamB);
    });

    function displayTeams(teamA, teamB) {
        // 이전 목록 지우기
        teamAList.innerHTML = '';
        teamBList.innerHTML = '';

        // A조 채우기
        teamA.forEach(person => {
            const listItem = document.createElement('li');
            listItem.textContent = person;
            teamAList.appendChild(listItem);
        });

        // B조 채우기
        teamB.forEach(person => {
            const listItem = document.createElement('li');
            listItem.textContent = person;
            teamBList.appendChild(listItem);
        });

        // 조 이름에 인원 수 업데이트
        teamANameEl.textContent = `A조 (${teamA.length}명)`;
        teamBNameEl.textContent = `B조 (${teamB.length}명)`;
    }

    function clearTeamDisplay() {
        teamAList.innerHTML = '';
        teamBList.innerHTML = '';
        teamANameEl.textContent = 'A조 (0명)';
        teamBNameEl.textContent = 'B조 (0명)';
    }
});