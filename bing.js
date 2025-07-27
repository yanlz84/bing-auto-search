// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.194
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
var default_search_words = ["保护城市独特的历史文脉", "双胞胎姐妹诈骗园区获救后态度冷漠", "多所高校宣布延长研究生学制", "事关防汛抗旱 国务院作出部署", "女子要取走390万现金 柜员报警", "特朗普：泰柬同意停火", "47岁元斌与妻子现身美术馆", "年内已有三个家居企业创始人被留置", "林依晨二胎后首露面 素颜白到发光", "上千万金饰被冲走 有人带探测仪寻金", "6人遇难矿企2024信用等级较差", "高铁扫码可自由调温？12306回应", "释永信被带走调查？少林寺回应", "专家：全球已近30万人感染基孔肯雅热", "当事人自述感染基孔肯雅热症状", "租客被房东偷电9年 电费近10万", "以为会发胖实际很减肥的6个行为", "50岁女子称被男网友骗了30多万", "河北阜平暴雨致2死2失踪", "特朗普与鲍威尔罕见公开争吵", "陈梦黄晓明一起看岳云鹏演唱会", "北京密云强降雨：山洪淹没部分村庄", "《年轮》原唱争议对音乐行业是个警醒", "朱雀玄武敕令自曝被送精神病院", "牛弹琴：特朗普这次干了件好事", "北京密云特大暴雨 局地交通通信中断", "特朗普：泰国和柬埔寨同意停火", "尘封15年出租车女司机命案告破", "广东蚊子会飞河南吗", "蔡依林舞台还是太权威了", "北海摩托艇事件谁该担责", "女子跟风生吃彩椒碗感染钩虫", "非机动车鬼探头撞直行车负全责", "郭德纲岳云鹏演唱会说相声", "《南京照相馆》单日票房过亿", "《年轮》原唱之争密密麻麻是谁的自尊", "北京强降雨引发山洪 密云有村庄被淹", "成都“砸车侠”担任世运会火炬手", "中央气象台27日发布暴雨黄色预警", "美客机急降约145米避免撞上军机", "加沙已饿死85名儿童", "华为首次展出“算力核弹”真机", "第9号台风“罗莎”今早加强为台风级", "正部长级王受文有新职", "金正恩参谒中朝友谊塔并献花圈", "互联网企业反腐 多家大厂高管落马", "婴儿育婴馆洗澡时摔下1米多高操作台", "印度小偷行窃后挂火车外侧趁机跳车", "北京升级地质灾害风险橙色预警", "成都这场火炬传递藏了多少故事", "俄罗斯唯一航母或将被拆 沦为备件"]

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
