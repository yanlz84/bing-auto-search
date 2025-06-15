// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.111
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
var default_search_words = ["这条路 习主席为何称其名垂青史", "以色列顶尖科研院被炸 遇袭瞬间曝光", "幼儿园一年关掉2万所", "短短90秒 仿佛看到父亲的一生", "四川宜宾4.8级地震 重庆成都有震感", "印度又一飞机坠毁 机上7人全部遇难", "直击苏超：倒数第二对阵倒数第一", "黎巴嫩人边听萨克斯边看伊朗导弹雨", "朱丹重男轻女惹争议", "汪峰带3娃过父亲节 二女儿罕见露面", "第94分钟绝杀 徐州队1-0击败镇江", "90%的父亲都会听到过的谣言", "伊朗新一轮导弹袭击已致超200人死伤", "诗人郑愁予去世 享年92岁", "伊称在对以袭击中使用新型弹道导弹", "罗永浩直播间1元抢福利", "伊朗称不会再如以前一样同IAEA合作", "以军要求伊朗核反应堆周围人员撤离", "编剧于雷发文痛批杨坤篡改革命歌曲", "45岁方力申官宣小14岁妻子怀孕", "直击苏超：连云港vs苏州", "59岁郭富城宣布妻子方媛怀上三胎", "男子鸣笛引不满 强行驶离致1死4伤", "隔夜发泡的木耳毒倒68岁阿姨", "伊朗中部一武器工厂遭以色列空袭", "李梦无缘中国女篮热身赛", "曾毅公开戴不雅手表是否违法", "有亲子鉴定所非亲生率达22%", "#在苏超现场观赛有多过瘾#", "刘亦菲大背头造型 霸总味十足", "南通踢球第一 干饭也第一", "扬州门将燃尽了 多角度回看扑救集锦", "星巴克降价5块有用的话要瑞幸干嘛", "以色列袭击前 美国悄悄送300枚导弹", "苏超倒数第一争夺战 赢球靠信仰", "四川省地震局启动四级应急响应", "苏超喊话：欢迎村超来踢球旅游", "驻有美军的伊拉克空军基地遭袭", "印度为何暂停向日本出口稀土", "女子回应交房维权视频被指擦边", "苏州摊牌了 派唐僧前往连云港", "国内顶尖洞穴潜水员在广西洞潜去世", "《宁安如梦》版无锡vs常州", "徐州大战镇江 门口安保安全感十足", "事关“苏超” 江苏省长提出要求", "常州喊话无锡：是时候赢回笔画了", "伊朗向以发射约50枚弹道导弹", "企业中毒事故致7死4伤 26人被问责", "杭州一泡泡玛特开业当天闭店", "以军预计伊朗将继续发动导弹袭击", "“唐僧师徒”现身苏超"]

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
