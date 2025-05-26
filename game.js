document.addEventListener('DOMContentLoaded', () => {
    const playerCountInput = document.getElementById('player-count');
    const playerNamesArea = document.getElementById('player-names-area');
    const resultsArea = document.getElementById('results-area');
    const generateInputsButton = document.getElementById('generate-inputs-button');
    const startGameButton = document.getElementById('start-game-button');
    const ladderContainer = document.getElementById('ladder-container');
    const gameResultArea = document.getElementById('game-result-area');

    let players = [];
    let results = [];
    let ladder = []; // 사다리 가로줄 데이터: ladder[rowIndex][colIndex] = true 이면 (col, row)에서 오른쪽으로 가로줄 존재
    const LADDER_ROWS = 10; // 사다리 가로 단계 수 (높이)
    let numPlayers = 0;

    generateInputsButton.addEventListener('click', () => {
        numPlayers = parseInt(playerCountInput.value);
        if (numPlayers < 2 || numPlayers > 8) {
            alert("참가자 수는 2명에서 8명 사이여야 합니다.");
            return;
        }

        createInputFields(numPlayers);
        startGameButton.style.display = 'inline-block';
        generateInputsButton.style.display = 'none'; // 필드 생성 후 버튼 숨기기
    });

    startGameButton.addEventListener('click', startGame);

    function createInputFields(count) {
        playerNamesArea.innerHTML = '';
        resultsArea.innerHTML = '';

        const nameHeader = document.createElement('h3');
        nameHeader.textContent = '참가자 이름';
        playerNamesArea.appendChild(nameHeader);

        const resultHeader = document.createElement('h3');
        resultHeader.textContent = '결과 항목';
        resultsArea.appendChild(resultHeader);


        for (let i = 0; i < count; i++) {
            const playerNameInput = document.createElement('input');
            playerNameInput.type = 'text';
            playerNameInput.placeholder = `참가자 ${i + 1}`;
            playerNameInput.id = `player-name-${i}`;
            playerNamesArea.appendChild(playerNameInput);

            const resultInput = document.createElement('input');
            resultInput.type = 'text';
            resultInput.placeholder = `결과 ${i + 1}`;
            resultInput.id = `result-text-${i}`;
            resultsArea.appendChild(resultInput);
        }
    }

    function startGame() {
        players = [];
        results = [];

        // 입력된 참가자 이름 및 결과 가져오기
        for (let i = 0; i < numPlayers; i++) {
            const playerName = document.getElementById(`player-name-${i}`).value.trim() || `참가자 ${i + 1}`;
            const resultText = document.getElementById(`result-text-${i}`).value.trim() || `결과 ${i + 1}`;
            players.push(playerName);
            results.push(resultText);
        }

        if (players.length !== results.length || players.length === 0) {
            alert("참가자 수와 결과 수가 일치해야 합니다.");
            return;
        }

        generateLadderData();
        drawLadder();
        displayInitialResults();
        startGameButton.textContent = "다시 시작"; // 버튼 텍스트 변경
    }


    function generateLadderData() {
        ladder = [];
        for (let i = 0; i < LADDER_ROWS; i++) {
            ladder[i] = new Array(numPlayers - 1).fill(false); // 각 행의 가로줄 정보 초기화
        }

        // 각 행마다 랜덤하게 가로줄 추가 (너무 많거나 적지 않게 조절)
        for (let row = 0; row < LADDER_ROWS; row++) {
            let placedRungsInRow = 0;
            for (let col = 0; col < numPlayers - 1; col++) {
                // 이전 열에 가로줄이 있다면 현재 열에는 만들지 않음 (가로줄이 이어지지 않도록)
                if (col > 0 && ladder[row][col - 1]) {
                    continue;
                }
                // 가로줄 생성 확률 (예: 35%) 및 한 행에 너무 많은 가로줄 방지
                if (Math.random() < 0.35 && placedRungsInRow < Math.floor(numPlayers / 2) ) {
                    ladder[row][col] = true;
                    placedRungsInRow++;
                }
            }
        }
    }

    function drawLadder() {
        ladderContainer.innerHTML = ''; // 이전 사다리 지우기
        ladderContainer.style.height = `${LADDER_ROWS * 30 + 20}px`; // 사다리 높이 동적 설정 (30px per row + padding)


        const ladderWidth = ladderContainer.clientWidth;
        const segmentWidth = ladderWidth / (numPlayers); // 각 세로줄 사이 간격 + 여백 고려

        // 세로줄 그리기 및 참가자 이름 표시
        for (let i = 0; i < numPlayers; i++) {
            const vLine = document.createElement('div');
            vLine.classList.add('vertical-line');
            const lineXPosition = segmentWidth * (i + 0.5) - 2; // 중앙 정렬 (-2는 선 두께의 절반)
            vLine.style.left = `${lineXPosition}px`;
            vLine.style.height = '100%';
            ladderContainer.appendChild(vLine);

            // 참가자 이름
            const playerNameLabel = document.createElement('div');
            playerNameLabel.classList.add('player-label');
            playerNameLabel.textContent = players[i];
            playerNameLabel.style.left = `${lineXPosition - 40 + 2}px`; // 라벨 위치 조정 (너비/2 - 선두께/2)
            playerNameLabel.dataset.index = i; // 플레이어 인덱스 저장
            playerNameLabel.addEventListener('click', (e) => { // 이름 클릭 시 경로 추적
                const playerIndex = parseInt(e.target.dataset.index);
                traceAndShowPath(playerIndex);
            });
            ladderContainer.appendChild(playerNameLabel);

            // 결과 항목 (자리만)
            const resultLabel = document.createElement('div');
            resultLabel.classList.add('result-label');
            resultLabel.textContent = "???"; // 초기엔 가려둠
            resultLabel.id = `result-display-${i}`;
            resultLabel.style.left = `${lineXPosition - 40 + 2}px`;
            ladderContainer.appendChild(resultLabel);
        }

        // 가로줄 그리기
        const rowHeight = (ladderContainer.clientHeight - 20) / LADDER_ROWS; // -20은 상하단 여유 공간
        for (let row = 0; row < LADDER_ROWS; row++) {
            for (let col = 0; col < numPlayers - 1; col++) {
                if (ladder[row][col]) {
                    const hLine = document.createElement('div');
                    hLine.classList.add('horizontal-line');
                    hLine.style.width = `${segmentWidth}px`;
                    hLine.style.left = `${segmentWidth * (col + 0.5) -2}px`;
                    hLine.style.top = `${row * rowHeight + (rowHeight / 2) + 10 - 2}px`; // +10은 상단 여유, -2는 선 두께
                    hLine.dataset.row = row; // 경로 추적 시 식별 위해
                    hLine.dataset.col = col; // 경로 추적 시 식별 위해
                    ladderContainer.appendChild(hLine);
                }
            }
        }
    }

    function tracePath(playerIndex) {
        let currentRow = 0;
        let currentCol = playerIndex;
        const pathCoordinates = [{ col: currentCol, row: -1 }]; // 시작점 (이름 위치)

        while (currentRow < LADDER_ROWS) {
            pathCoordinates.push({ col: currentCol, row: currentRow });
            // 오른쪽으로 가로줄이 있고, 현재 위치가 그 가로줄의 시작점일 때
            if (currentCol < numPlayers - 1 && ladder[currentRow][currentCol]) {
                currentCol++; // 오른쪽으로 이동
                pathCoordinates.push({ col: currentCol, row: currentRow }); // 이동 후 위치
            }
            // 왼쪽으로 가로줄이 있고, 현재 위치가 그 가로줄의 끝점일 때
            else if (currentCol > 0 && ladder[currentRow][currentCol - 1]) {
                currentCol--; // 왼쪽으로 이동
                pathCoordinates.push({ col: currentCol, row: currentRow }); // 이동 후 위치
            }
            currentRow++; // 아래로 한 칸 이동
        }
        pathCoordinates.push({ col: currentCol, row: LADDER_ROWS }); // 최종 도착점 (결과 위치)
        return { finalCol: currentCol, path: pathCoordinates };
    }

    function highlightPath(pathCoords) {
        // 이전 경로 하이라이트 제거
        document.querySelectorAll('.path').forEach(el => el.classList.remove('path'));

        const ladderWidth = ladderContainer.clientWidth;
        const segmentWidth = ladderWidth / numPlayers;
        const rowHeight = (ladderContainer.clientHeight - 20) / LADDER_ROWS;

        for (let i = 0; i < pathCoords.length -1; i++) {
            const p1 = pathCoords[i];
            const p2 = pathCoords[i+1];

            let pathElement = document.createElement('div');
            pathElement.classList.add('path'); // 하이라이트 스타일 적용

            if (p1.row === p2.row) { // 수평 이동 (가로줄)
                pathElement.style.height = '4px';
                pathElement.style.width = `${segmentWidth}px`;
                pathElement.style.top = `${p1.row * rowHeight + (rowHeight / 2) + 10 - 2}px`;
                pathElement.style.left = `${segmentWidth * (Math.min(p1.col, p2.col) + 0.5) -2}px`;
            } else if (p1.col === p2.col) { // 수직 이동
                pathElement.style.width = '4px';
                pathElement.style.height = `${rowHeight}px`;
                pathElement.style.top = `${Math.min(p1.row, p2.row) * rowHeight + 10 + (p1.row === -1 ? -rowHeight/2 : rowHeight/2) }px`;
                if(p1.row === -1) pathElement.style.height = `${rowHeight/2}px`; // 이름 ~ 첫 가로줄
                if(p2.row === LADDER_ROWS) pathElement.style.height = `${rowHeight/2}px`; // 마지막 가로줄 ~ 결과

                pathElement.style.left = `${segmentWidth * (p1.col + 0.5) - 2}px`;

                 // 시작점 (이름에서 첫번째 가로줄까지) 또는 끝점 (마지막 가로줄에서 결과까지) 처리
                if (p1.row === -1) { // Start from player name
                    pathElement.style.height = `${rowHeight / 2 + 10}px`; // 이름 라벨에서 첫번째 가로선 중앙까지
                    pathElement.style.top = `${0}px`; // 이름 바로 아래부터
                } else if (p2.row === LADDER_ROWS) { // End at result
                    pathElement.style.height = `${rowHeight / 2 + 10}px`; // 마지막 가로선 중앙에서 결과 라벨까지
                    pathElement.style.top = `${(LADDER_ROWS - 0.5) * rowHeight + 10 -2}px`;
                } else { // 일반 세로 구간
                     pathElement.style.top = `${p1.row * rowHeight + (rowHeight / 2) + 10 -2 }px`;
                }
            }
            if(pathElement.style.width || pathElement.style.height) { // 유효한 요소만 추가
                 ladderContainer.appendChild(pathElement);
            }
        }
    }


    function traceAndShowPath(playerIndex) {
        const { finalCol, path } = tracePath(playerIndex);

        // 모든 결과 ??? 로 초기화
        for(let i=0; i<numPlayers; i++){
            const resLabel = document.getElementById(`result-display-${i}`);
            if(resLabel) resLabel.textContent = "???";
        }

        // 해당 플레이어의 결과만 표시
        const resultDisplay = document.getElementById(`result-display-${finalCol}`);
        if (resultDisplay) {
            resultDisplay.textContent = results[finalCol]; // 실제 결과 텍스트로 변경
            resultDisplay.style.fontWeight = 'bold';
        }

        highlightPath(path); // 경로 하이라이트

        // 게임 결과 영역 업데이트 (선택된 사람만)
        gameResultArea.innerHTML = `<p><strong>${players[playerIndex]}</strong> 님의 결과: <strong>${results[finalCol]}</strong></p>`;
    }

    function displayInitialResults() {
        gameResultArea.innerHTML = '<p>참가자 이름을 클릭하여 결과를 확인하세요.</p>';
        for (let i = 0; i < numPlayers; i++) {
            const resultLabel = document.getElementById(`result-display-${i}`);
            if (resultLabel) {
                resultLabel.textContent = "???"; // 클릭 전에는 결과 가리기
                resultLabel.style.fontWeight = 'normal';
            }
        }
         // 이전 경로 하이라이트 제거
        document.querySelectorAll('.path').forEach(el => el.classList.remove('path'));
    }

    // 초기에는 참가자 수 입력만 보이도록
    playerNamesArea.innerHTML = '';
    resultsArea.innerHTML = '';
});