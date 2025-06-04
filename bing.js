// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.88
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
var default_search_words = ["习近平的文化足迹", "李在明当选韩国总统 任期正式开始", "卫健委通报女游客遭毒蛇咬伤身亡", "追火箭上火星 科技旅游火出圈", "马斯克怒批特朗普税改法案：令人作呕", "香港恒生银行抢劫案嫌犯在深圳落网", "吴京的车又翻了", "英伟达重夺全球市值第一头衔", "常州足协回应常州输成l州", "赶考出行这些事项要留意", "大学生校内钓鱼被制止后自己滚水里", "高考前吃素能提高智商？谣言", "李在明当选 中韩关系会回暖吗", "女子在动物园被大猩猩反向投喂", "27岁女游客在三亚被蛇咬伤身亡", "科学家发现超级地球 或存类地生命", "拖走女童案 “寻衅滋事”为何受质疑", "男友还原女子在三亚被蛇咬身亡过程", "因姓名同音传唤错人 廊坊法院致歉", "乐基儿二度离婚后首谈黎明：没联系了", "彭于晏方发声明 否认与蔡依林恋情", "Labubu为什么能让爱马仕沦为背景板", "郑钦文：目前处于淋雨状态", "韩国又创造历史 对中国是个小小惊喜", "曹骏回应拒演短剧争议", "李在明能否治愈撕裂的韩国", "巴黎世家线上已下架4500元半身裙", "三年连破三次死局 李在明掌舵青瓦台", "得知陶喆比外婆还大1岁 小孩哥震惊", "75岁老人吞鱼刺没重视出现高烧症状", "雷军称YU7标准版相当于竞品Max版", "金文洙宣布败选 向李在明表示祝贺", "哈佛女孩对网友质疑的愤懑错位了", "俄罗斯公布俄乌停火备忘录", "李在明出身贫寒：贪赌的爸 拮据的家", "女子当街打砸汽车：系精神病发作", "记者发现成都仍有火车票代售点", "女子为祈福放生2.5万斤外来鲇鱼", "王毅：中方严格落实中美经贸会谈共识", "新人结婚前一天开车坠河双双遇难", "萨巴伦卡为郑钦文打出好球鼓掌", "李在明称将尽最大努力履职", "郑钦文回应萨巴吼叫是否干扰自己", "李在明推进将韩总统府迁回青瓦台", "国家安全部公布三起网络攻击案例", "外交部回应日本人在华被害", "深圳警方通报一女子大厦高坠死亡", "泽连斯基：反对重启扎波罗热核电站", "西藏阿里发生4.0级地震", "因车祸住院801天434天挂空床", "李在明感谢韩国国民"]

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
