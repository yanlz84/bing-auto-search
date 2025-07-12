// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.165
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
var default_search_words = ["热爱与坚守", "中核集团重大突破：成功产出第一桶铀", "十分钟很短但这是她30年的痛苦", "这份防中暑秘籍请收好", "罗马仕中层：五个老板全跑马来西亚了", "一片热带植物叶子何以卖到30万元", "净网：来看1起侵犯公民个人信息案", "00后大学舍友 最熟悉的陌生人", "第二代居民身份证迎换证高峰", "3000万辆中国汽车利润不及丰田1家", "村民捞手机索要1500元未果又扔水里", "海南电动车头盔分春夏冬三款？假", "多名高校领导被查 有人主动投案", "杨瀚森NBA首秀填满数据栏", "台湾制火箭在日本发射失败 画面曝光", "高温晒背2小时67岁阿姨竟开颅保命", "一顿饭花3600元被盯着不让拍视频", "特斯拉车顶维权女车主被判赔17万", "印度空难初步调查聚焦飞行员操作", "要求孙颖莎对手“懂点事” 郭焱道歉", "冯巩缺席杨少华葬礼引争议", "遭陌生人强拉拍照游客称不需要赔偿", "湖南一少年在游泳馆内触电身亡", "粉丝喊妈妈吓宋佳一跳", "杨少华去世当天剪彩没收钱", "临沂通报菜品视频被罚45万事件", "杨瀚森开场第一球就送出妙传", "杨瀚森夏联首秀背后藏着这些细节", "保安小哥在地铁“发泄式演讲”3分钟", "中美外长面谈 特朗普访华更有谱了吗", "梁诗祎660分成全国女飞行员榜首", "林诗栋蒯曼夺美国大满贯混双冠军", "游客在洪崖洞遭红衣女子拉拽拍照", "皮蛋在美国供不应求", "中国女排3比1击败加拿大", "武汉会战 日军在华损失最惨一役", "270余人遇难 印空难驾驶舱对话公开", "爆冷！王楚钦、梁靖崑男双无缘决赛", "欧洲热死人了 但还是开不起空调", "1元一张的“刮刮乐”你买过吗", "杨少华死亡证明单首次公开", "白发婆婆苹果店里敲代码惊呆路人", "湘潭大学投毒案凶手在宿舍舞剑磨刀", "全国唯一做宝剑的专业：就业率近100%", "33吨金银精矿在墨西哥被劫", "库尔德工人党女战士焚烧武器画面", "夏天穿长袖长裤真的更凉快吗", "黄金平替遭扫货 价格创近14年新高", "市长带领导班子成员现场听贪官忏悔", "王毅16字概括中美外交走向", "吴彦祖前女友MaggieQ官宣结婚"]

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
