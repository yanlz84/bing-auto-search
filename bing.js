// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.316
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
var default_search_words = ["总书记心中“很有意义”的一个事业", "抗“冻”6年的蔡磊已丧失语言能力", "网友建议成渝申办奥运会 成都回应", "这是我们的新疆！", "重仓奇瑞 汕头兄妹赚进160亿", "陕西小村庄住一晚已经要两千了", "女子租房6年房东多次主动降租", "韩国总统李在明在纽约街头也被拦", "雷军曝陈年10年还清10亿债务", "当新疆金秋美景遇到国庆假期", "刘备扮演者孙彦军成大学校长", "广州番禺石楼镇遭严重水浸系谣言", "男子68页PPT曝妻子出轨华南理工博士", "又见恶俗婚闹 伴娘遭捆绑被逼接吻", "中学承诺考上清北奖50万 教育局回应", "小米17全系列售价公布 4499元起", "香港女子带孩子台风天观浪被拘", "贵州“天下第一水司楼”变身酒店", "王暖暖若按正常程序离婚需等到70岁", "雷军：小米17电量几乎是iPhone17两倍", "菲总统：不能让南海争议定义中菲关系", "小学要求父母到校陪餐 教体局回应", "特朗普宣布对进口重卡加征25%关税", "演唱会出轨门女主丈夫也被曝婚内出轨", "广电总局：坚决抵制违法失德人员", "特朗普批准华盛顿特区恢复死刑", "美军战机紧急升空拦截4架俄军机", "台风走了胶带却撕不掉了", "北京一动物园猴子靠“爱心头”出圈", "美防长要求数百名军方将领紧急集结", "奶奶送走8个月残疾女婴 妈妈苦寻", "王暖暖离婚案今日开庭", "雷军大方推荐友商产品", "男子每早2根油条吃出动脉硬化", "伊朗总统：愿通过外交谈判解决核问题", "《阿凡达3》确认引进中国内地", "最新研究刷新人类演化时间线", "录取通知书有假？57个家庭被骗381万", "伊朗披露以色列核设施敏感数据", "70岁大爷“辟谷”7天险丧命", "俄图-95在中立水域上空巡航超14小时", "男子撞人后未报警送医致伤者身亡", "奇瑞汽车上市首日市值超1840亿港元", "神二十乘组圆满完成第四次出舱活动", "纽约最近有点挤 北约秘书长也被拦", "福建舰三型舰载机更多弹射画面公开", "伊拉克总理称中央政府接收库区原油", "28日起台风博罗依将影响广东", "忍痛保16人安全的司机左眼保住了", "丹麦西部多地上空再现不明无人机", "以军数十架战机大规模空袭胡塞武装"]

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
