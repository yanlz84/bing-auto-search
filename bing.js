// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.426
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
var default_search_words = ["总书记为全面依法治国指明前进方向", "最后2只旅日大熊猫即将回国", "危险信号！日本首次出口爱国者导弹", "全运会见证湾区“大联通”", "向高市提问议员：听到回答心想糟了", "北京上演“天空幻境”！朝霞美成壁纸", "央视曝光问题加油站作弊“花招”", "日本冲绳县再曝驻日美军性暴力事件", "“地表最强特警”任山西公安副厅长", "扎哈罗娃警告高市早苗", "日本民众东京集会 反对政府扩张军备", "大湾区政策红利发放系虚假信息", "中方回应“日方称不知磋商后有媒体”", "被骗缅北儿子对母亲说就当没生过我", "高市早苗涉台谬论已触犯中方底线", "英伟达上季营收加速增长62%再超预期", "网红“橙子姐姐”在柬埔寨被逮捕", "人形机器人为普京献舞", "中国邮轮放弃日本靠岸 取消乘客下船", "摄影师揭秘拍“人类坠入太阳”过程", "网红橙子姐姐曾邀女网友去柬埔寨", "喻恩泰回应婚变", "特朗普政府宣布拆解教育部计划", "高市早苗言论引众怒 为何有恃无恐", "霍震霆回应和孙子在内地旅游被偶遇", "来华磋商的日高官回国 神色凝重", "中国军号发布高市早苗玩火漫画", "美智库：日推行二战来最野心防务扩张", "解放军警告日本", "战胜吴艳妮的刘景扬称练田径已20年", "清华美女研究生获全运会跳高冠军", "非法集资127亿 李亮等7人被判刑", "吴艳妮全运会100米栏亚军", "日本旅游遭秒冻 日媒关注百度热搜", "陈梦哭了", "正直播NBA：火箭vs骑士", "赴日骤减 中国游客被多国“争抢”", "科学家在地下700米捉“鬼”", "新华时评：高市开历史倒车必将失败", "俄与波兰关系恶化 俄将作出回应", "陈梦率山东队员领取金牌", "胖东来招聘要求国内仅8所高校符合", "载有260人的客轮在韩国珍岛附近搁浅", "南海舰队版如果战斗今夜打响", "日本金融市场“熊出没”", "叶国富为什么要重开6000家门店", "中方对荷方主动暂停行政令表示欢迎", "全运会今日看点：苏炳添迎来谢幕战", "网红“橙子姐姐”账号被封", "全运会看点：乒乓男团迎“京沪大战”", "今天是心梗救治日"]

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
