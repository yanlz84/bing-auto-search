// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.27
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
var default_search_words = ["总书记青春寄语滋润心田", "贵州黔西2艘游船侧翻 约70人落水", "外交部国防部罕见接连发声", "大数据揭秘五一假期热门旅游地", "女子靠帮人“断舍离”年入上百万", "千万网红“田姥姥”外孙疑家暴劈腿", "“撕拉片”走红 拍一张需要300元", "女子在沙滩玩20分钟捡了小半兜钉子", "卡式炉爆炸 7人受伤变“木乃伊”", "五一假期返程高峰要来了", "女子哭着报警：不小心把老公忘高速上", "三亚辟谣游客出海与向导失散", "黑马赵心童会创造中国斯诺克历史吗", "西安现条状不明飞行物 目击者：像龙", "五一旅游vlog就这么发", "国羽苏迪曼杯四连冠", "巴基斯坦大使：若开战将动用核武器", "浙江一乐园回应男子未系安全绳蹦极", "胡塞武装导弹击中以色列机场", "荣昌扯面大爷累到“表情失控”", "陕西一景区大量虫子往游客脖子里钻", "输液过敏离世女生曾要求皮试被拒", "董子健热度连续破亿的背后", "女生输头孢过敏 自行拔针仍身亡", "为什么每个景区特产都有酸奶", "澳大利亚大选也现“大反转”", "莲花推出复古涂装限定版Emira跑车", "西安夜空不明黑影 气象台：无法解释", "景区回应灵隐寺小卖部年租金260万", "女教师从326斤减重到170斤", "五一假期余额还剩两天", "威少生死战爆砍全能数据", "医院为掉进火锅受伤的猫免费治疗", "以防长：将对袭击者“加倍报复”", "跟曹骏认识10年的编剧找他演戏被拒", "短剧一哥柯淳称日薪报两万没人找", "上海欢乐谷通报园区内突发火情", "胖东来投诉后 主播“柴怼怼”被封号", "民警在景区3天捡了25个孩子", "徐卫东受审 260多名同事旁听", "景区飞天魔毯失控 多名游客被甩出", "西湖边的大屏也申请五一休假了", "教育局长让下属跨省帮其女办婚礼", "宇多田光质问日本改夫姓制度引热议", "奶茶包装使用不雅文字遭吐槽", "女子在杭州吃饭喝到“榨菜汤”", "00后男生成百位老人的全职孙子", "天降猫咪掉火锅 老板扛下全责", "巴菲特批评贸易战：75亿人不喜欢你", "易小星称女儿被主播哄骗买成人玩具", "全红婵称发育期最大问题是不够自律"]

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
