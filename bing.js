// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.140
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
var default_search_words = ["“红船劈波行 精神聚人心”", "央视曝光舞蹈培训市场乱象", "榕江雨有多大？三天降下46个西湖", "洪灾之下 每一个“你”都有人牵挂", "歼20紧急升空逼退外军战机", "最后一天！没办理个税汇算的要抓紧了", "朱雀玄武敕令：想出名 黑红也是红", "三女儿齐唱歌曲送别父亲黄旭华", "邓超发文回应和鹿晗吃饭", "伊核设施已被毁？特朗普和媒体吵起来", "小S女儿在画展上谈及大S", "2人造谣科研人员虐待大熊猫获刑", "徐州队2-1泰州 苏超最新排名出炉", "北大退学考上清华小伙回应开直播", "感受上海最新地标LV巨轮的人流量", "鹿晗手机屏保疑似是和关晓彤的合照", "贵州榕江灾后清淤社会车辆禁止驶入", "中方有条件恢复日部分地区水产进口", "记者卧底：养生直播“围猎”老人钱包", "巴黎圣日耳曼4比0迈阿密国际", "长春亚泰1比2上海申花", "白玉兰组委会疑似回应刘亦菲没去", "印度三男子强奸法学院女生被拘4天", "陈垣宇0比4张本智和", "曝日本计划征收“单身税”", "哈登两年8150万续约快船", "21名小学生凑钱聚餐 老板主动补贴", "前公婆称前儿媳因不满离婚判决举报", "今年15个充电宝飞机上起火冒烟", "重庆发布暴雨黄色预警", "曝哈登计划拒绝3600万美元球员选项", "鹿晗演唱会直拍", "泰国总理向泰王提交新内阁名单", "马龙去看林俊杰演唱会：嗓子又哑了", "以色列称伊朗间谍试图暗杀以防长", "以色列再爆发大规模抗议", "平台回应游客冰岛租车遭天价索赔", "伊要求联合国承认以美对战争负责", "法国总统呼吁遵守以伊停火协议", "俄方：普京特朗普随时可能会晤", "美爱达荷州多名消防员救火时遭袭击", "南通队4比0宿迁队", "莫斯科音乐厅恐袭嫌疑人指控乌克兰", "孟子义曾因为太漂亮失去角色", "美参议院对“大而美”法案进行辩论", "外卖员送餐途中遇 “关门杀”", "伊总统：准备开启与波斯湾邻国新篇章", "13省份有大到暴雨", "惠英红抑郁破产后如何重生", "伊朗大不里士炼油厂一氮气罐爆炸", "#暴雨再袭榕江灾区现场直击#"]

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
