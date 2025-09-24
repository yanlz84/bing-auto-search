// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.313
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
var default_search_words = ["情暖天山 建功奋进", "台风“桦加沙”在广东阳江登陆", "北方人亲历台风把自己绑床上过夜", "全力应对台风桦加沙", "中国每4个成年人就有1名高血压患者", "桦加沙会影响国庆长假吗？专家回应", "台风致澳门海水倒灌 居民上街抓鱼", "男子被困深圳酒店72层 看到风雨逼近", "美主播：要么退出联合国要么炸了它", "桦加沙登陆现场：巨浪翻涌风声大作", "江苏省教育厅：必要时可停课停学", "台风来袭记住“十要十不要”", "网红“敖其尔”因病逝世 年仅36岁", "桦加沙狂袭阳江 湖面翻腾树木狂舞", "张雪峰多个平台账号被禁止关注", "台风桦加沙风力“爆表”破纪录", "广州15米巨树被台风连根拔起", "黑熊披袈裟站着走是人扮的？景区回应", "广州：18时起终止全市“五停”措施", "广东江门：全市交通信号灯亮红灯", "协和专家谭先杰吃头孢过敏进抢救室", "深圳：全市解除“五停”措施", "#今年最强台风桦加沙有多恐怖#", "贵州仁怀通报投资8亿建厂遭强行接管", "中方回应石破茂联大演讲", "桦加沙登陆阳江 台风眼画面曝光", "受桦加沙影响 广东多地出现海水倒灌", "中方回应特朗普指责中印购买俄石油", "湖北一身家千万老板钓鱼时落水失踪", "1万亿比索打水漂 菲总统陷执政危机", "宁夏图书馆密集安装摄像头？馆方回应", "2026研考时间定了", "泽连斯基：特朗普现在更信任我了", "评论员：台军那些破烂飞机不堪一击", "珠海积水街道成河 居民称水深达一米", "广东珠海出现17级阵风", "全球仍有31亿人用不起智能手机上网", "泽连斯基：愿与普京在除莫斯科外会晤", "桦加沙重创台湾 桥被洪水冲断", "福建舰的“号外”出现在王伟墓前", "瑞幸苹果拿铁文案为什么“翻车”", "验蟹师年收入10万至30万元", "国台办：中国对台湾海峡享有主权", "台湾一押解警车失控致通缉犯死亡", "莫言：AI创作的文章毫无情感和思想", "本轮巴以冲突致加沙地带65419人死亡", "泰国曼谷一医院门前突发大面积塌陷", "特朗普联大演讲被指充满对抗性", "中部战区空军多位女飞行员集中亮相", "台风桦加沙横扫大湾区沿海", "学信网客服回应公众号回复“诡异”"]

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
