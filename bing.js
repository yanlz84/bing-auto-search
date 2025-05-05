// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.29
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["引领新时代中俄关系坚毅前行", "《哪吒2》总票房将超越《泰坦尼克号》", "中国出手 稀土价格暴涨210%", "新玩法点亮假日经济", "不出口美国了 上海市民疯狂“捡漏”", "王晶曝刘德华感情史：做刘太太很辛苦", "女生晒照片被网友发现血管瘤", "春晚机器人五一兼职累瘫了", "护士论文写男性确诊子宫肌瘤被记过", "假期返程 警惕四个事故多发“口”", "贵州游船倾覆事故70人还在医院救治", "桂林象鼻山景区分时段计费？假", "游船倾覆事故70名落水人员均为轻伤", "重庆荣昌“赢麻了”背后站着三个人", "女子放羊休息时被蛇咬当场被疼哭", "敦煌月牙泉目之所及全是人", "奈飞美股盘前跌3%", "当事人回应烧烤遇卡式炉爆炸被炸伤", "日本女孩报警遭漠视 4个月后成白骨", "马丽称不会与沈腾终止合作", "《蛮好的人生》大结局太癫了", "医院违规为单身女性做试管婴儿", "知情人回应陈奕迅演唱会投弹画面", "男子开保时捷撞人后换车牌 警方通报", "赵朔正在找小猫悟空去世线索", "台湾花莲县海域发生5.7级地震", "日本一地出现神秘地鸣", "谢霆锋妹妹谢婷婷宣布怀二胎", "刘国梁卸任后对王励勤说了这句话", "高速堵车源头竟是司机在睡觉", "重大政策转变 巴基斯坦宣布新禁令", "目击者回忆贵州游船侧翻", "泰山两游客翻护栏差点坠崖 场面惊险", "男性患子宫肌瘤论文怎么发出来的", "希尔德0罚33分成NBA历史首人", "今日立夏万物至此皆长大", "胖东来讨厌“胖都来”们", "孙俪为何专挑“中年疯女人”来演", "巴基斯坦决定向安理会通报南亚局势", "胡塞武装导弹袭以机场羞辱性极强", "巴基斯坦再次试射一地对地导弹", "有人追高炒黄金1天亏6年工资", "特朗普称对进口电影征收100%关税", "华晨宇演唱会炒饭免费 粉丝吃了3吨", "小猫“悟空”去世仍有多个疑点", "“侏儒网红”李喜梅和大双哥复合", "斯洛伐克总理将出席俄胜利日阅兵式", "哈利伯顿攻防俱佳 22分13助1断3帽", "医院涉嫌违规做试管婴儿 卫健委介入", "男子被猴子抢食还挨了一巴掌", "陈小春高瀚宇默契度100%"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
