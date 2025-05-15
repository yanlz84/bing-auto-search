// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.49
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
var default_search_words = ["习近平复信中国丹麦商会负责人", "国家卫健委通报肖飞董袭莹事件", "董袭莹协和4+4入学资格造假", "团结协作共迎挑战的“中拉声音”", "肖飞被吊销医师执业证书", "中央军委决定调整组建3所军队院校", "这些习惯正在泄露你的个人信息", "病重老人银行取钱去世 家属发声", "农行公布老人办业务期间离世时间线", "暴涨50倍 炒撕拉片的人已经赚到钱了", "杨天真回应如何变瘦", "贵阳现“不合理蛙”？专家辟谣", "新冠又活跃了 南方阳性率略高于北方", "刘晓庆已退出被举报涉偷税公司股东", "新任国防部新闻发言人蒋斌正式亮相", "澳首枚自主研制运载火箭发射推迟", "中方不同意台湾地区参加世卫大会", "樊振东现身上海和平公园参加活动", "成都龙泉山网红树被砍成秃头", "黄杨钿甜耳环风波", "刘诗诗回应是否考虑恶女角色", "黄杨钿甜父亲已辞去公职8年", "男子失踪7年被找到 正躺桥洞玩手机", "李亚鹏妻子自曝没钱 从大平层换小房", "台当局威胁查处欧阳娜娜等人", "刘晓庆曾说偷税又不会死", "杨天真瘦成不穿大码女装的样子了", "郑钦文说完全有打败萨巴伦卡的实力", "樊振东回应成为上海城市文明大使", "黄埔海关查获“爆炸式铆钉”19800枚", "于正回复吴谨言复出问题", "《歌手2025》首期歌单公布", "郑钦文回应首胜萨巴伦卡", "印度又断水：大坝关闭 下游河床裸露", "黄杨钿甜称200多万耳环是妈妈的", "邱贻可幽默回应马龙从队友变领导", "阿里巴巴Q4营收同比增长7%", "农行称重病客户可预约上门服务", "废品回收站发现几百个机密文件", "女生过度防晒睡觉翻身时骨折", "哪吒汽车创始人被冻结2000万股权", "芒果一口气官宣88部大剧", "中国对巴西等5国实行免签政策", "央视评肖战《藏海传》释出的最新预告", "犯强奸罪教师出狱办教培？官方通报", "俄乌直接谈判有望重启 谁参加谈什么", "专家：以方与胡塞武装冲突有升级趋势", "密云农民为抗日烈士守墓17年", "西部黄金：总经理因工作调整原因辞职", "广东一村结婚奖1万 秒到账", "招商银行原副行长丁伟等人被公诉"]

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
