// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.314
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
var default_search_words = ["完整准确全面贯彻新时代党的治疆方略", "俞孔坚坠亡前最后影像曝光", "广州塔“定塔神器”出现明显摆动", "从两种精神看新疆70年巨变", "老人去世留8套房 给非亲生女儿最多", "陪爬泰山男演员回应转行种地", "桦加沙二次登陆广西北海", "俞孔坚坠机身亡 巴西总统悼念", "女博士捡到耳机通过知网找到失主", "天山焕新颜 丝路著华章", "特朗普对俄“态度突变” 原因披露", "台风来袭记住“十要十不要”", "海滩退潮遍地生蚝 市民捡到手软", "女生住60层以上遇台风 半夜被晃醒", "泽连斯基：乌克兰决定开放武器出口", "“A股好岳父”转给女婿2.8亿元股份", "俄港口城市遭袭 进入紧急状态", "北京大学教授俞孔坚在巴西坠机遇难", "台湾87岁老人在家中淹死 女儿泪崩", "俞孔坚空难去世 失事飞机1958年制造", "远亲不如近邻具象化了", "“象棋第一人”王天一认罪", "特朗普：联合国发生“非常险恶”事件", "花莲灾情严重 韩国瑜捐一个月薪水", "胖东来面试30名刑释人员：全部录用", "牛弹琴：美国迎来一位最特殊客人", "“晕车晕机见多了 晕楼不常见”", "珠海海水倒灌流入地下车库", "广东国家救灾应急响应升至三级", "全球仍有31亿人用不起智能手机上网", "汽车门把手国标要来了：禁止全隐藏式", "女孩殒命巴厘岛 幸存者回忆中毒疑云", "台风过后广州奶茶店外卖“爆单”", "美国正式公告：征收欧盟汽车15%关税", "台风天司机驾车“玩水”致店铺受损", "桦加沙狂袭阳江 湖面翻腾树木狂舞", "湖北一身家千万老板钓鱼时落水失踪", "桦加沙会影响国庆长假吗？专家回应", "瑞幸苹果拿铁文案为什么“翻车”", "中方回应石破茂联大演讲", "伊朗总统：伊朗不会追求拥有核武器", "胡塞无人机再次击中以色列南部城市", "国台办：台湾无权加入国际民航组织", "搅黄“双城论坛” 赖清德惺惺作态", "吉利星座完成一期组网", "台湾梅花鹿在台风巨浪中游泳", "桦加沙登陆现场：巨浪翻涌风声大作", "航行警告 黄海海域开展军事行动", "验蟹师年收入10万至30万元", "受桦加沙影响 广东多地出现海水倒灌", "桦加沙登陆地为何多次调整？解读来了"]

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
