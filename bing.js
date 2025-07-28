// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.197
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
var default_search_words = ["跟着总书记看火热的改革发展现场", "育儿补贴来了！3岁前每娃每年3600元", "哪些家庭可以领育儿补贴？怎么领", "华北东北持续多雨 警惕次生灾害", "释永信所作所为性质十分恶劣", "2025百度热搜年中报告出炉", "北京：请市民非必要不外出", "中方已在北京和东京向日方严正交涉", "揭“大熊猫被虐”谣言背后利益链", "北京：关闭全市所有景区", "一孩二孩三孩均可申领育儿补贴", "年收入12万以下基本无需缴税", "#多次被举报的释永信为何才被查#", "北京市民非必要不要求到岗上班", "陈佩斯《戏台》票房逆跌说明什么", "具俊晔在大S墓前看《流星花园》", "国家明确！育儿补贴免征个税", "泰国柬埔寨就停火协议达成一致", "曝“赵四”刘小光儿子家暴", "王传君看《南京照相馆》回放崩溃大哭", "育儿补贴预计8月下旬陆续开放申领", "中方敦促乌克兰立即纠正错误", "覃海洋世锦赛100米蛙泳夺金", "中方回应在美中国学者被无理拘押", "《南京照相馆》适合孩子看吗", "苹果首次在中国关停直营店", "柬埔寨公主中文发声呼吁和平", "山东省政府参事袭燕主动投案", "BOSS直聘：男子假冒女性编造涉黄简历", "李嘉诚旗下长和港口交易重大调整", "《还珠格格》柳红箫剑合体", "女孩ICU里收到录取通知书后苏醒", "爸爸回应女儿去世儿子患同种病进ICU", "罗大美遇害后凶手套现2.5万余元", "男子退房留下粉瓶子 他们果断报警", "洪水后未开封瓶装饮料不宜再饮用", "司机等红灯向路人射钢珠致4人受伤", "6个月工资一万三被索赔两万多", "《城南旧事》小英子扮演者重现名场面", "陈芋汐掌敏洁夺得女双10米台金牌", "俄外长：俄面临与整个西方作战局面", "特大暴雨中的密云山村", "多名老人在火车走道放音乐跳广场舞", "曼谷枪击事件枪手当场自尽", "韩国热到冰美式都不冰了", "15件热搜大事回顾2025上半年", "外交部回应长和卖港口最新公告", "梁靖崑发文报平安", "男子轻信1万1平能买上海市中心房", "罗大美遇害后父亲瘦了近20斤", "女子用餐称生牛肉上有蛆 市监局回应"]

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
