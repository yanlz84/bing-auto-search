// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.60
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
var default_search_words = ["看曾经冷门的文物保护热起来", "被打后还手属于正当防卫还是互殴", "连续4任市长被查 昆明市委发声", "降息了 你的房贷和存款会怎样", "年轻人最不缺的结婚条件被取消了", "美公布新核弹 威力是广岛原子弹21倍", "日本民众称从天天米饭到每周三次", "大爷减重30斤登上国家级新闻发布会", "倒查十年！广西党委书记要求严肃追责", "日本末日论正在网上疯传", "男子在家中建10米长鱼缸养巨骨舌鱼", "钱塘江被围起来不给钱不给看？不实", "巴基斯坦科学家带女儿来上海治病", "广厦夺队史首冠 胡金秋泪洒赛场", "夫妻相爱7年女方胖了182斤 丈夫回应", "男生掉化粪池遇难 妈妈殡仪馆晕倒", "美发布“金穹”导弹防御系统规划", "华为想把23999元的折叠电脑卖给谁", "大爷嫌银行利息低花百万买6斤黄金", "钟睒睒：农夫山泉所有产品无法代工", "520凌晨贵阳8小时13596次闪电", "泰国猫咪袭警被捕超萌入狱照走红", "凤阳文旅局长回应鼓楼瓦片脱落", "浙江广厦首次加冕CBA总冠军", "住建部：我国超9.4亿人生活在城镇", "江西一女子从12楼不慎坠落奇迹生还", "小伙回应一年卖255辆宝马收入70万", "日本农林水产大臣递交辞呈", "黄杨钿甜艺考成绩被质疑 学校回应", "此轮大范围高温天气成因是什么", "六大行集体降息 楼市迎来利好", "王楚钦比赛状态炸裂 5连胜黄镇廷", "欧洲对以色列连连出手", "小沈阳故宫行引围观", "黄仁勋：全球一半AI人才都是中国人", "男子骑车路过松动地砖发生意外", "#普京和特朗普通话谈得怎么样#", "男子当众猥亵脱口秀女演员被拘", "美军阅兵式恰逢特朗普生日 细节曝光", "王励勤为王楚钦球拍损坏事件发声", "华纳回应陈奕迅女儿签约", "四川慈善总会回应“230万耳环”事件", "凤阳鼓楼是违建？县文旅局长回应", "护士发错药致患者误服数日 医院回应", "校长安排人用防水漆为学生画跳房子", "俄方称将向中国通报停火谈判细节", "曼城3-1伯恩茅斯", "娄艺潇实力还原福建三大渔女造型", "巴基斯坦罕见病女童在沪获成功治疗", "多哈世乒赛5月21日赛程公布", "姚安娜戴工牌到车间工厂打工"]

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
