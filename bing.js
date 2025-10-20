// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.364
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
var default_search_words = ["总书记擘画中国式现代化新篇章", "又一个“国家级都市圈”获批", "35岁陪爬泰山男演员转行景区NPC", "六个“新”字看成绩", "煎饼摊走红：顾客排队5小时舍不得吃", "美国为何盯上“北京时间”", "郑丽文：绝不让台湾成“麻烦制造者”", "一货机在香港机场降落冲出跑道坠海", "泽连斯基：愿参加特朗普与普京的会晤", "卢浮宫失窃藏品清单公布", "台风“风神”和冷空气联手了", "梭子蟹里都是寄生虫不能吃系谣言", "二十届四中全会今起召开", "以军报复性空袭后恢复执行停火协议", "万科起诉万达", "台名嘴：让美国继续停留在20世纪吧", "停运！暴雪！断崖式降温！", "火车免费坐？12306今起又上新功能", "卢浮宫失窃文物已找回2件", "新人结婚请柬在机场88块屏幕连播8天", "杨振宁雕像前放满鲜花", "被苏超这段解说燃到了", "俄美共建白令海峡隧道？特朗普回应", "中东又悬了 战火已开始重燃", "郑丽文接棒国民党主席 将面临三挑战", "台风“风神”最新位置发布", "夫妻自驾到内蒙捡蔬菜：捡了约500斤", "谁在利用1068号段发送诈骗短信", "全国各地最低工资标准情况公布", "蹦极项目不用绳子 景区回应", "男子多次给220年古树投毒被控制", "男子偷300张“刮刮乐”后连夜出逃", "于和伟谈台湾观众看《沉默的荣耀》", "毛人凤饰演者张晞临为吴石像献花", "拍卖行人士：卢浮宫窃贼很难销赃", "台湾丈夫携北京妻儿祭奠吴石将军", "杜兰特2年9000万续约火箭", "遭美国网攻的国家授时中心有多重要", "银行清理沉睡账户 卡里的钱怎么办", "一诺达成700胜局", "卢浮宫抢劫亲历者：以为遇到恐袭", "卢浮宫被盗过程仅7分钟", "卢浮宫遭盗抢闭馆 游客质疑安保措施", "同行者野钓溺亡遭索赔70万被驳", "卢浮宫盗贼破窗进入 窗外有起重机", "未来3天冷冷冷冷冷", "哈马斯称又发现一名人质遗体", "印度74岁男子在自建火葬场办假葬礼", "攀岩悄悄破圈 打工人排队“上墙”", "朱枫烈士家书揭秘赴台潜伏心路历程", "专家解读多地天空现密集鸟群"]

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
