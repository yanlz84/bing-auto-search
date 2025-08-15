// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.233
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
var default_search_words = ["读懂“两山”理念的科学路径", "普京特朗普会谈地数百特工入驻", "2岁男童走失3天3夜在丛林中被找到", "日本无条件投降原声", "“3女带4孩续面”事件双方已和解", "大学教授“收废品” 一年狂揽300亿", "净网：“苏星颜”造谣牟利被罚", "董某莹肖某事件5家机构19人被问责", "大暴雨特大暴雨要来了", "演员秦杨查出肺腺癌又突然失明", "继女要求继承600万遗产遭亲生子拒绝", "董某莹成绩单造假学位论文抄袭", "理发店取名“最高发院” 市监局回应", "19岁抗癌女孩去世 生前拍下婚纱遗照", "吉训明任协和医学院院校长", "今日一起读抗战英雄家书", "特朗普将以最高礼仪亲自迎接普京", "郭德纲妻子持有德云社99%股份", "网传协和2名学生为某院士孙女不属实", "南方烧烤申请出战", "曝甜系顶流小花飞升内幕", "中方回应石破茂向靖国神社供奉祭品", "女子服用两年牛黄解毒片后砒霜中毒", "律师谈40万卡地亚手镯疑被小孩捡走", "多地高铁站称仍卖泡面但车上不能吃", "俄总理提前返回莫斯科", "国防部：要求菲方立即停止侵权挑衅", "质疑校服质量被拘家长发声：中度抑郁", "人民日报：不能让网上假专家再坑人了", "微信聊天又有新功能", "美俄总统会晤在即 俄外长最新表态", "女子四川旅游偶遇藏式婚礼被惊艳", "男子翻出20年前麦当劳兑换券获回应", "两部门：深入整改协和4+4试点班", "住户半夜砌墙把楼道大堂圈进自己家", "飞机上两乘客互相泼水 航司回应", "女子将新能源汽车开上树 警方回应", "重庆一女童被大型犬咬伤 警方介入", "云南“吃菌老司机”在浙江“翻车”", "问日本孩子二战败给哪国 没人提中国", "女子回应备孕10年生下患尿毒症宝宝", "房门被巨量垃圾堵住 社区：老人捡的", "国防部：打“独”促统一刻不停", "李梦全运会资格赛再次大杀四方", "男子吃烧烤被噎邻桌医生20秒救回", "中国载人登月又有新突破", "女子开空调做饭一家3口中毒", "记者直击美俄领导人阿拉斯加会晤地", "李在明：不追求吸纳统一朝鲜", "胡兵与机器人一起走秀", "国防部回应美驱逐舰侵闯中国黄岩岛"]

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
