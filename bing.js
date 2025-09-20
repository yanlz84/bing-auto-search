// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.305
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
var default_search_words = ["交通强国建设全面提速", "美国炸弹落下之地竖起中国风机", "运油-20“旱地拔葱”式起飞", "长春航展最新“剧透”来了", "教师不愿当班主任 原因不能仅老师扛", "特朗普扔签证“炸弹”：返美机票大涨", "净网：网警破获“AI换脸”侵入系统案", "女子婚后起诉父母返还18万彩礼", "巴基斯坦确认向沙特提供核保护伞", "始祖鸟烟花“劝退”了真正的户外人", "年轻人为何选择从大同出境游", "官方辟谣“深圳核心区放开限购”", "家门口失踪10多天的2岁女童已离世", "日籍演员平田康之在华演20多年日军", "泡泡玛特新品定价59元 网友：听劝了", "起猛了 看到歼-20停在了我面前", "董璇：有两个孩子不可能一碗水端平", "男子被蛇咬伤骑车就医 半路毒发摔倒", "歼-20：拜托把我拍得好看一点", "最萌的娃和最帅的人同框", "直击苏超：盐城vs连云港", "始祖鸟在喜马拉雅山脉放烟花引争议", "资产上亿医美女老板疑被骗去泰国", "秦始皇求仙问药的“昆仑”在哪里", "反内卷！药品集采不再简单选最低报价", "始祖鸟回应在喜马拉雅山脉放烟花", "女童20楼坠至13楼雨棚 被业主拽住", "喜马拉雅山脉烟花秀引质疑 当地回应", "第一批iPhone17贴膜受害者出现了", "直击苏超：泰州vs南京", "男子寻亲成功：靠自己打拼成千万富翁", "高中运动会惊现“降维打击”", "玉龙雪山牛奶湖加装护栏 当地回应", "香港炸弹拆除工作基本完成", "台湾海峡发生地震 福建多地震感明显", "残障父亲回家后 女儿决定找出黑砖厂", "快手、微博被网信部门查处", "短视频暴力起号还有多少套路", "美国大豆中国订单量仍为零", "湖北隧道冒顶事故致4死 官方督办", "直击苏超：南通vs淮安", "中国有望2028年前突破太空旅游技术", "93阅兵最飒女机长亮相长春航展", "当区长2个月被查 他被披露跑官要官", "男子评论局长免职消息被拘 处罚撤销", "多地密集出台新政 楼市迎战金九银十", "林孝埈晒北海公园打卡照", "台湾警方机场连开八枪制服拒检司机", "金建希哥哥涉嫌“买官卖官”被传唤", "飞人博尔特自曝身体素质大不如前", "微博回应被约谈"]

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
