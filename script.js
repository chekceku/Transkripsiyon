
////Diller Baş////
var langs = [
    ['Afrikaans', ['af-ZA']],
    ['Bahasa Indonesia', ['id-ID']],
    ['Bahasa Melayu', ['ms-MY']],
    ['Català', ['ca-ES']],
    ['Čeština', ['cs-CZ']],
    ['Dansk', ['da-DK']],
    ['Deutsch', ['de-DE']],
    ['English', ['en-AU', 'Australia'],
        ['en-CA', 'Canada'],
        ['en-IN', 'India'],
        ['en-NZ', 'New Zealand'],
        ['en-ZA', 'South Africa'],
        ['en-GB', 'United Kingdom'],
        ['en-US', 'United States']],
    ['Español', ['es-AR', 'Argentina'],
        ['es-BO', 'Bolivia'],
        ['es-CL', 'Chile'],
        ['es-CO', 'Colombia'],
        ['es-CR', 'Costa Rica'],
        ['es-EC', 'Ecuador'],
        ['es-SV', 'El Salvador'],
        ['es-ES', 'España'],
        ['es-US', 'Estados Unidos'],
        ['es-GT', 'Guatemala'],
        ['es-HN', 'Honduras'],
        ['es-MX', 'México'],
        ['es-NI', 'Nicaragua'],
        ['es-PA', 'Panamá'],
        ['es-PY', 'Paraguay'],
        ['es-PE', 'Perú'],
        ['es-PR', 'Puerto Rico'],
        ['es-DO', 'República Dominicana'],
        ['es-UY', 'Uruguay'],
        ['es-VE', 'Venezuela']],
    ['Euskara', ['eu-ES']],
    ['Filipino', ['fil-PH']],
    ['Français', ['fr-FR']],
    ['Galego', ['gl-ES']],
    ['Hrvatski', ['hr_HR']],
    ['IsiZulu', ['zu-ZA']],
    ['Íslenska', ['is-IS']],
    ['Italiano', ['it-IT', 'Italia'],
        ['it-CH', 'Svizzera']],
    ['Lietuvių', ['lt-LT']],
    ['Magyar', ['hu-HU']],
    ['Nederlands', ['nl-NL']],
    ['Norsk bokmål', ['nb-NO']],
    ['Polski', ['pl-PL']],
    ['Português', ['pt-BR', 'Brasil'],
        ['pt-PT', 'Portugal']],
    ['Română', ['ro-RO']],
    ['Slovenščina', ['sl-SI']],
    ['Slovenčina', ['sk-SK']],
    ['Suomi', ['fi-FI']],
    ['Svenska', ['sv-SE']],
    ['Tiếng Việt', ['vi-VN']],
    ['Türkçe', ['tr-TR']],
    ['Ελληνικά', ['el-GR']],
    ['български', ['bg-BG']],
    ['Pусский', ['ru-RU']],
    ['Српски', ['sr-RS']],
    ['Українська', ['uk-UA']],
    ['한국어', ['ko-KR']],
    ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'],
        ['cmn-Hans-HK', '普通话 (香港)'],
        ['cmn-Hant-TW', '中文 (台灣)'],
        ['yue-Hant-HK', '粵語 (香港)']],
    ['日本語', ['ja-JP']],
    ['हिन्दी', ['hi-IN']],
    ['ภาษาไทย', ['th-TH']],
];
////Diller Son////


////Dil Seçimi Baş////
var select_language = document.getElementById('select_language');
var select_dialect = document.getElementById('select_dialect');
var start_button = document.getElementById('start_button');
var stop_button = document.getElementById('stop_button');

for (var i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
}

select_language.selectedIndex = 29;
updateCountry();
select_dialect.selectedIndex = 0;

function updateCountry() {
    for (var i = select_dialect.options.length - 1; i >= 0; i--) {
        select_dialect.remove(i);
    }
    var list = langs[select_language.selectedIndex];
    for (var i = 1; i < list.length; i++) {
        select_dialect.options.add(new Option(list[i][1], list[i][0]));
    }
    select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}
////Dil Seçimi Son////


////Speech Recognition Motoru Baş////
var create_email = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
        recognizing = true;
        showInfo('info_speak_now');
    };

    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
            showInfo('info_no_speech');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            showInfo('info_no_microphone');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showInfo('info_blocked');
            } else {
                showInfo('info_denied');
            }
            ignore_onend = true;
        }
    };

    recognition.onend = function () {
        recognizing = false;
        if (ignore_onend) {
            return;
        }
        start_img.src = '/intl/en/chrome/assets/common/images/content/mic.gif';
        if (!final_transcript) {
            showInfo('info_start');
            return;
        }
        showInfo('');
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
            var range = document.createRange();
            range.selectNode(document.getElementById('final_span'));
            window.getSelection().addRange(range);
        }
        if (create_email) {
            create_email = false;
            createEmail();
        }
    };

    recognition.onresult = function (event) {
        var interim_transcript = '';
        if (typeof (event.results) == 'undefined') {
            recognition.onend = null;
            recognition.stop();
            upgrade();
            return;
        }
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        updateResults(final_transcript, interim_transcript);
        if (final_transcript || interim_transcript) {
            showButtons('inline-block');
            scrollDown();
        }
    };
}
////Speech Recognition Motoru Son////


////Bilgi Mesajı Baş////
function upgrade() {
    showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;

function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;

function capitalize(s) {
    return s.replace(first_char, function (m) {
        return m.toUpperCase();
    });
}


function copyButton() {
    copyToClipboard(final_transcript);
    showCopyFeedback();
}

////Geli Bildirim Baş////
function showCopyFeedback() {
    var feedbackElement = document.getElementById('copy_feedback');
    feedbackElement.textContent = 'Metin kopyalandı!';
    feedbackElement.style.display = 'block';
    setTimeout(function () {
    feedbackElement.style.display = 'none';
    }, 2000);
}
////Geli Bildirim Son////
////Bilgi Mesajı Son////

////Buton Baş////
//Start
function startButton(event) {
    if (recognizing) {
        recognition.stop();
        return;
    }
    showInfo('info_start');
    recognition.lang = select_dialect.value;
    recognition.start();
    ignore_onend = false;
    showButtons('none');
    start_timestamp = event.timeStamp;
    start_button.style.display = 'inline-block';
    stop_button.style.display = 'inline-block';
}
//Result Temizleme
function clearTranscription() {
    final_transcript = '';
    document.getElementById('final_span').textContent = '';
    document.getElementById('interim_span').textContent = '';
    document.getElementById('placeholder_span').style.display = 'block';  // placeholder_span'ı göster
}
//Stop
function stopButton() {
    if (recognizing) {
        recognition.stop();
        recognizing = false;
        showInfo('info_stop'); // Durduruldu mesajını göster
    }
}
document.getElementById('stop_button').addEventListener('click', stopButton);

//Butonların Görünürlüğü Baş
function showInfo(messageId) {
    var info = document.getElementById('info');
    for (var child = info.firstChild; child; child = child.nextSibling) {
        if (child.style) {
            child.style.display = 'none';
        }
    }

    if (messageId) {
        var message = document.getElementById(messageId);
        if (message) {
            message.style.display = 'inline';
        }
    }

    info.style.visibility = 'visible';
}


function showButtons(style) {
    var copyButton = document.getElementById('copy_button');
    var downloadButton = document.getElementById('download_button');
    var stopButton = document.getElementById('stop_button');
    var clearButton = document.getElementById('clear_button'); // Yeni eklenen satır
    var copyInfo = document.getElementById('copy_info');

    if (style === 'inline-block') {
        copyButton.style.display = style;
        downloadButton.style.display = style;
        stopButton.style.display = style;
        clearButton.style.display = style; // Yeni eklenen satır
        copyInfo.style.display = 'none';
    } else {
        copyButton.style.display = 'none';
        downloadButton.style.display = 'none';
        stopButton.style.display = 'none';
        clearButton.style.display = 'none'; // Yeni eklenen satır
        copyInfo.style.display = 'none';
    }
}
//Butonların Görünürlüğü Son

//İndirme Butonu
function downloadTranscription() {
    var blob = new Blob([final_transcript], { type: 'text/plain' });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'transkripsiyon.txt';
    link.click();
}

//Kopyalama Butonu
function copyToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

////Buton Son////


////Resultu Güncelleme////
function updateResults(finalText, interimText) {
    // Placeholder'ı gizle
    document.getElementById("placeholder_span").style.display = "none";

    // Final ve interim metinleri güncelle
    document.getElementById("final_span").textContent = finalText;
    document.getElementById("interim_span").textContent = interimText;

    // Sonuçları göster
    document.getElementById("final_span").style.display = "inline";
    document.getElementById("interim_span").style.display = "inline";
}
////Resultu Güncelleme Son////
