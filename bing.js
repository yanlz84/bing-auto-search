// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.193
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
var default_search_words = ["习主席谈到一个生动比喻", "老凤祥价值上千万金饰被洪水冲走", "DeepSeek真的“凉”了吗", "这些知识提前知道能救命", "现在的年轻人流行“内推前任”", "演唱会CEO出轨事件最大赢家出现了", "国外研究：“外星飞船11月袭击地球”", "今年暑假 酒店比游客更穷", "佟丽娅回应和陈思诚离婚后关系", "樊振东：深受饭圈困扰 被陌生人闯房间", "前央视主持人离职后自曝后悔", "高铁扫码可自由调温？12306回应", "女生凌晨未接挪车电话 车子被砸", "又杠上了 张碧晨方疑再次回应争议", "“七下八上”到底有多猛", "吴克群活成了\"吴克穷\"", "杨紫琼晒与LV三公子合照喊话Lisa", "金龟子女儿办婚礼 董浩现身", "中国驻日使馆向日方提出严正交涉", "扫地也要笔试 招44人有198人报名", "2025世界人工智能大会", "“东北神饮”白桦树汁走上高端酒桌", "《年轮》之争为何成了三输局面", "百度获上海智能网联汽车示范运营牌照", "还会代表中国队比赛吗 樊振东回应", "女子减肥饿晕冲刺10米栽倒看呆同事", "曝何猷君上市公司拖欠员工半年工资", "女孩割完牛草路上收到北大通知书", "“19%对0” 菲律宾炸锅了", "北大将全面取消绩点", "林依晨二胎后首露面 素颜白到发光", "柬埔寨公民在泰国遭殴打 画面曝光", "李子柒：好喜欢火炬“竹梦”的造型", "美国客机又险些撞上战机", "谢霆锋妹妹二胎产子晒一家四口合照", "王琳给儿子打电话情绪失控 倪萍哭了", "宇树机器人和人类拳击对决", "“超级县”崛起：两县GDP破5000亿", "贵州“村超”重新开赛", "山西人爱午睡究竟是为啥", "泰国准备撤侨", "胖东来成酒企“续命神器”", "樊振东回应退出世界排名", "受台风影响15省市将迎大到暴雨", "国务院食安办：加强婴幼儿食品监管", "马来西亚23岁青年感染鼠尿病身亡", "武汉一政务大厅变自习室 每天满座", "香格里拉郭惠光 女二代接班900亿", "前车翻车 妻子冷静指挥丈夫救人", "老挝否认与柬埔寨武装人员交火", "“打螺丝”小游戏打穿朋友圈"]

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
